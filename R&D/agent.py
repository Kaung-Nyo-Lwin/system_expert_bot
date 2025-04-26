import os
import re
from typing import List, Tuple

from llama_index.core.workflow import (
    Workflow,
    Context,
    step,
    Event,
    StartEvent,
    StopEvent,
    InputRequiredEvent,
    HumanResponseEvent,
)

from llama_index.core import (
    VectorStoreIndex,
    StorageContext,
    load_index_from_storage
)
from llama_index.core import SimpleDirectoryReader, Document
from llama_index.llms.openai import OpenAI
# from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.utils.workflow import draw_all_possible_flows
from langchain.embeddings import HuggingFaceInstructEmbeddings
import InstructorEmbedding
from langchain.embeddings import HuggingFaceInstructEmbeddings
from langchain_groq import ChatGroq
from dotenv import load_dotenv
import knowledge_graph_pipeline as pipeline

class GenerateQuestionsEvent(Event):
    """Triggered after setup, contains the original user query and a list of follow‑up questions."""

    UserQuery: str
    GeneratedQuestions: List[str]
    Feedback: str


class QueryEvent(Event):
    """Triggered after question generation – contains the composite textual query to the RAG engine."""

    SQLQuery: str


class GraphEvent(Event):
    """Triggered after retrieval – contains table/column names extracted from relevant SQL snippets."""
    pass

class ResponseEvent(Event):
    """Contains the natural‑language answer generated for the user."""

    Response: str


class FeedbackEvent(Event):
    """Contains free‑form user feedback about the previous response, used to decide whether to loop."""
    Feedback: str

class SoftwareDocBot(Workflow):
    """A Retrieval‑Augmented Generation (RAG) workflow with human‑in‑the‑loop feedback.

    Steps
    -----
    1. set_up – Build / load the vector store, then trigger GenerateQuestionsEvent.
    2. generate_questions – Use LLM to decompose the user query into follow‑up questions, trigger QueryEvent.
    3. rag_query – Query the vector store, collect relevant SQL and tables, trigger ResponseEvent & GraphEvent.
    4. graph_query – (Optional) Enrich with knowledge graph metadata (stub for now), trigger ResponseEvent.
    5. document_response – Draft a user‑facing answer, then pause via InputRequiredEvent.
    6. get_feedback – Decide whether to stop, or loop back to rag_query with extra feedback.
    """
    def __init__(self, storage_dir: str, data_dir: str, model: str = "groq", *args, **kwargs):
        super().__init__(*args, **kwargs)
        load_dotenv()
        # openai.api_key = os.environ['OPENAI_API_KEY']
        self.llm_groq = ChatGroq(
            model="llama-3.1-8b-instant",
            temperature=0,
            max_tokens=None,
            timeout=None,
            max_retries=2,
        )
        self.llm_openai = OpenAI(model="gpt-4o-mini")
        self.embedding_model = HuggingFaceInstructEmbeddings(
            model_name = 'hkunlp/instructor-base'
        )
        self.model = model
        # -------- constants ------------------------------------------------------
        self.storage_dir: str = storage_dir
        self.data_dir: str = data_dir  # directory containing *.sql files to embed

    def _generate(self, prompt: str) -> str:
        if self.model == "groq":
            return self.llm_groq.predict(prompt)
        elif self.model == "4o-mini":
            return self.llm_openai.complete(prompt).text
        else:
            raise ValueError(f"Unknown model: {self.model}")

    def document_sql(self) -> str:
        # Translate SQL to English
        doc_prompt = (
            "You are an expert SQL analyst who knows business processes."
            "You will be given a SQL procedure and need to analyze it."
            "Provide a detailed explanation of the SQL procedure with the following format:"
            "1. Overview: What the SQL procedure does?"
            "2. Input: What are the input parameters?"
            "3. Output: What is the expected output?"
            "4. Tables: What tables are used?"
            "5. Logic: What is the logic of the SQL procedure?"
            "6. Operations: What operations are used(read, write, update, delete)?"
            "7. UseCase: What is the use cases of the SQL procedure?"

            "Output: Markdown format."

            "SQL Procedure: {sql}"
        )

        # load docs
        docs = SimpleDirectoryReader("docs", recursive=True).load_data()
        
        for i, doc in enumerate(docs[1:], start=1):
            if doc.text:
                answer = self._generate(doc_prompt.format(sql=doc.text))
                # create a file and write answer to text file
                with open(f"ourspace/{i}.txt", "w") as f:
                    f.write(answer)
                

        return f"{i} procedures are documented"

    def extract_query_labels(self, sql_query):
        loaded_knowledge_graph = pipeline.load_kg_graphml('sql_knowledge_graph')
        parsed_query = pipeline.parse_sql(sql_query)
        _, query_id = pipeline.update_kg_with_query(loaded_knowledge_graph, parsed_query)
        return pipeline.extract_query_labels(loaded_knowledge_graph, query_id)

    
    # -------- set‑up ---------------------------------------------------------
    @step
    async def set_up(self, ctx: Context, ev: StartEvent) -> GenerateQuestionsEvent:
        """Initialise the LLM, embedding model, vector store & query engine."""
        # LLM
        # self.llm = Groq_llm
        
        # Build / load the vector index
        if os.path.exists(self.storage_dir):
            storage_context = StorageContext.from_defaults(persist_dir=self.storage_dir)
            index = load_index_from_storage(storage_context, embed_model=self.embedding_model)
        else:
            # Read SQL files as Documents
            docs: List[Document] = []
            if os.path.exists(self.data_dir):
                docs = SimpleDirectoryReader(self.data_dir, recursive=True).load_data()
            else:
                print("[Warning] data_dir not found – creating empty index.")

            index = VectorStoreIndex.from_documents(
                docs,
                embed_model=self.embedding_model,
            )
            index.storage_context.persist(persist_dir=self.storage_dir)

        # Store the query engine for later steps
        self.retriever = index.as_retriever(similarity_top_k=5)

        # Save the user query in the context for later use
        await ctx.set("user_query", getattr(ev, "UserQuery", ""))       

        return GenerateQuestionsEvent(UserQuery=getattr(ev, "UserQuery", ""), GeneratedQuestions=[], Feedback="")

    # -------- question generation -------------------------------------------
    @step
    async def generate_questions(
        self, ctx: Context, ev: GenerateQuestionsEvent
    ) -> QueryEvent:
        """Generate follow‑up questions using the LLM (or reuse after feedback)."""
        user_query: str = await ctx.get("user_query")
        rag_prompt = (
            f"User Query: {user_query}\n. "
            "Based on the user query, retrieve the most relevant store procedures.\n"
        )
        retrieved_procedures = self.retriever.retrieve(rag_prompt)
        # extra_feedback: str = getattr(ev, "Feedback", "")
        user_feedback: str = getattr(ev, "Feedback", "")
        latest_response: str = await ctx.get("latest_response", default="")
        prompt = (
            "You are an expert SQL analyst who knows business processes. "
            "Break the following user request into 3 underlying questions "
            "that will help to answer the user request."
            "The questions will be used to retrieve the most relevant information."
            "The questions must be based on the available context given below."
            "Return each question on a new line.\n\n"
            f"User request: {user_query}\n"
            f"Available context: {retrieved_procedures}\n"
        )

        # if extra_feedback:
        #     prompt += f"\nPrevious feedback: {extra_feedback}\n"
        if user_feedback:
            prompt += f"\nUser feedback on the last answer: {user_feedback}\n"
        if latest_response:
            prompt += f"\n\n The last answer was: {latest_response}"

        # print(prompt)
        completion = self._generate(prompt)
        print(completion)
        questions: List[str] = [q.strip("- \n") for q in completion.splitlines() if q.strip()]

        await ctx.set("generated_questions", questions)
        composite_query = "\n".join(questions) if questions else user_query
        return QueryEvent(SQLQuery=composite_query)

    # -------- RAG query ------------------------------------------------------
    @step
    async def rag_query(self, ctx: Context, ev: QueryEvent) -> GraphEvent:
        """Retrieve relevant SQL procedures and extract involved tables."""
        query_text = ev.SQLQuery
        print(f"[RAG] Query: {query_text}")

        rag_prompt = (
            f"Query: {query_text}\n. "
            "Based on the query, retrieve the most relevant store SQL procedures and codes.\n"
            "Return only the SQL codes."
        )
        # Retrieve SQL codes
        results = self.retriever.retrieve(rag_prompt)
        sql_snippets: List[str] = [r.text for r in results] if results else []
        rag_prompt = (
            f"Query: {query_text}\n. "
            "Based on the query, retrieve the most relevant explanation of the SQL procedures.\n"
            "Return only the explanation written in natural language."
        )
        # Retrieve explanation
        results = self.retriever.retrieve(rag_prompt)
        explanation: str = results
        print(f"checking snippets {sql_snippets}")
        print(f"checking explanation {explanation}")

        # Extract table information
        # tables = _extract_tables(sql_snippets)
        # table_list = ", ".join(tables) if tables else "<none found>"

        # Store for later steps
        await ctx.set("retrieved_sql", sql_snippets)
        await ctx.set("explanation", explanation)
        # await ctx.set("tables", table_list)

        return GraphEvent()

    # -------- Graph query ----------------------------------------------------
    @step
    async def graph_query(self, ctx: Context, ev: GraphEvent) -> ResponseEvent:
        """Placeholder for graph lookup – currently just passes tables along."""
        # In a full implementation, we would query a KG here.
        # await ctx.set("graph_info", ev.Tables)
        user_query = await ctx.get("user_query")
        kg_prompt = (
            f"User Query: {user_query}\n. "
            f"Available context: {await ctx.get('retrieved_sql')}\n"
            "Based on the user query and available context, generate the most relevant single SQL query.\n"
            "Don't include any other information beyond the SQL query.\n\n"
            "Don't create a procedure. Just write the SQL code without subqueries.\n\n"
            "Return only the SQL code as string."
        )

        # Generate SQL query
        sql_query = self._generate(kg_prompt).replace("```sql", "").replace("```", "")
        print(f"Generated SQL query: {sql_query}")
        # await ctx.set("sql_query", sql_query)
        try:
            kg_info = self.extract_query_labels(sql_query)
            await ctx.set("kg_info", kg_info)
        except Exception as e:
            print(f"Failed to extract query labels: {e}")
            await ctx.set("kg_info", "")
        return ResponseEvent(Response="")

    # -------- Draft response -------------------------------------------------
    @step
    async def document_response(self, ctx: Context, ev: ResponseEvent) -> InputRequiredEvent:
        """Compose the final answer using LLM and pause for human feedback."""
        user_query = await ctx.get("user_query")
        sql_snippets: List[str] = await ctx.get("retrieved_sql")
        explanation: str = await ctx.get("explanation")
        # tables: str = await ctx.get("tables")
        # graph_info: str = await ctx.get("graph_info", default="")
        # tables = ""
        kg_info = await ctx.get("kg_info")

        context_blob = "\n\n".join(sql_snippets) if sql_snippets else "[No SQL snippets retrieved]"
        
        latest_response: str = await ctx.get("latest_response", default="")
        latest_feedback: str = await ctx.get("latest_feedback", default="")
        
        prompt = (
            "You are an expert business analyst who knows SQL and business processes."
            "Using the following SQL procedures, tables, explanation of the SQL procedures, "
            "and any graph info provided, answer the user's question in detail.\n\n"
            "Standard Format:"
            "Please provide a structured response with the following sections: \n"
            "1. rules: List of business rules identified \n"
            "2. constraints: List of business constraints \n"
            "3. calculations: List of any calculations or formulas \n"
            "4. workflows: List of process workflows \n"
            "5. tables: List of related tables \n"
            "Note:"
            "1. If you don't have enough information, just say 'Not enough information' for each section.\n\n"
            "2. If the specified section is provided in the context, use the provided information and ignore the standard format.\n\n"
            "Answer: The answer to the user's question. Don't include any other information beyond the standard format."
            "\n\n"
            "Output format: Markdown."
            "\n\n"
            "Context: The following information is provided for context: \n\n"
            "\n\n"
        )

        content = (
            f"User question:\n{user_query}\n\n"
            f"Generated questions:\n{await ctx.get('generated_questions')}\n\n"
            f"SQL procedures:\n{context_blob}\n\n"
            f"Tables, columns, and relationships found: {kg_info}\n\n"
            f"Explanation of the SQL procedures:\n{explanation}\n\n"
            "\n\n"
        )
        if latest_response:
            content += f"Last answser:\n{latest_response}\n\n"
        if latest_feedback:
            content += f"Last feedback:\n{latest_feedback}\n\n"
        
        # print(content)
        await ctx.set("latest_content", content)

        response_text = self._generate(prompt + content).strip()
        await ctx.set("latest_response", response_text)

        # Ask the human to review
        return InputRequiredEvent(prefix="How does this look? Give me any feedback you have on any of the answers.",
            result=response_text)

    # -------- Feedback loop --------------------------------------------------
    @step
    async def get_feedback(
        self, ctx: Context, ev: HumanResponseEvent
    ) -> GenerateQuestionsEvent | StopEvent:
        """Process human feedback – decide to loop or stop."""
        feedback_text = ev.response.strip()

        await ctx.set("latest_feedback", feedback_text)

        if feedback_text.lower().startswith("okay"):
            # We're done!
            print("[Workflow] Human accepted the answer. Stopping.")
            return StopEvent(result=await ctx.get("latest_response"))

        # Otherwise loop – feed the feedback into question generation again
        print("[Workflow] Received feedback – refining answer.")
        return GenerateQuestionsEvent(UserQuery=getattr(ev, "UserQuery", ""), GeneratedQuestions=[], Feedback=feedback_text)

async def answer_question(workflow, question):
    handler = workflow.run(
        UserQuery=question
    )
    # print(question)
    async for event in handler.stream_events():
        if isinstance(event, InputRequiredEvent):
            feedback = "OKay"
            handler.ctx.send_event(
                HumanResponseEvent(
                    response=feedback
                )
            )
    answer = await handler
    return str(answer)

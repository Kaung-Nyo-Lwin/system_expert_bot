from memory_store import chat_history
import os
import openai
import agent
import knowledge_graph_pipeline as pipeline
OPENAI_API_KEY = ""
os.environ["OPENAI_API_KEY"] = OPENAI_API_KEY
openai.api_key = os.environ['OPENAI_API_KEY']
Groq_API_KEY = ""

os.environ["GROQ_API_KEY"] = Groq_API_KEY

w = agent.SoftwareDocBot(
    storage_dir="ourspace_index", 
    data_dir="ourspace", 
    kg_graph="ourspace_sql_knowledge_graph",
    model="4o-mini", 
    timeout=600,
    verbose=True)


async def generate_response(user_input):
    response = await agent.answer_question(w, user_input)
    # response = f"The SQL retrieves {random.choice(['sales data', 'user profile', 'analytics'])}."
    chat_history.append({'user': user_input, 'bot': response})
    print("checking W.kg_viz:",w.kg_viz)
    nodes, edges = w.kg_viz
    #pdf_filename = create_pdf( bot_response=response) 
    #print(f"Parsing generated SQL query: {kg_viz}")
    return response, nodes, edges

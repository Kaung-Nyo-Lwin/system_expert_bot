import gradio as gr
from rag_engine import RAGEngine

# Initialize RAG engine
rag = RAGEngine("sample_schema.sql", use_llm=True)

def docbot_response(user_question):
    try:
        return rag.answer_nl_question(user_question)
    except Exception as e:
        return f"Error: {str(e)}"

iface = gr.Interface(
    fn=docbot_response,
    inputs=gr.Textbox(lines=4, placeholder="Ask about the software system..."),
    outputs=gr.Textbox(lines=12, label="SoftwareDocBot Answer"),
    title="🧠 SoftwareDocBot: Schema-Aware System QA",
    description="Ask natural language questions about how the system works. Based on your database schema.",
    theme="default"
)


if __name__ == "__main__":
    iface.launch()


"""Load the original agent only when a live request needs it."""
import os
from pathlib import Path

from .errors import ServiceUnavailable

BASE_DIR = Path(__file__).resolve().parent


async def generate_response(user_input):
    provider = os.getenv("LLM_PROVIDER", "groq")
    if provider not in {"groq", "4o-mini"}:
        raise ServiceUnavailable("LLM_PROVIDER must be groq or 4o-mini.")
    key = "GROQ_API_KEY" if provider == "groq" else "OPENAI_API_KEY"
    if not os.getenv(key):
        raise ServiceUnavailable(f"Set {key} in .env to enable live chat.")

    from .agent import SoftwareDocBot, answer_question

    # Each request owns its workflow and graph; visitors never share conversation state.
    workflow = SoftwareDocBot(
        storage_dir=str(BASE_DIR / "ourspace_index"),
        data_dir=str(BASE_DIR / "ourspace"),
        kg_graph=str(BASE_DIR / "ourspace_sql_knowledge_graph"),
        model=provider, timeout=120, verbose=False,
    )
    response = await answer_question(workflow, user_input)
    nodes, edges = workflow.kg_viz
    return response, nodes, edges

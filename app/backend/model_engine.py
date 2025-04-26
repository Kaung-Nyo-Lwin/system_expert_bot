from memory_store import chat_history
#import random
import os
import openai
import agent

OPENAI_API_KEY = ""
os.environ["OPENAI_API_KEY"] = OPENAI_API_KEY
openai.api_key = os.environ['OPENAI_API_KEY']
Groq_API_KEY = ""
os.environ["GROQ_API_KEY"] = Groq_API_KEY

w = agent.SoftwareDocBot(
    storage_dir="ourspace_index", 
    data_dir="ourspace", 
    model="4o-mini", 
    timeout=600,
    verbose=True)
async def generate_response(user_input):
    response = await agent.answer_question(w, user_input)
    # response = f"The SQL retrieves {random.choice(['sales data', 'user profile', 'analytics'])}."
    chat_history.append({'user': user_input, 'bot': response})

    return response, None

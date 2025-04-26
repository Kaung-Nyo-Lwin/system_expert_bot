from memory_store import chat_history
import random
def generate_response(user_input):
    response = f"The SQL retrieves {random.choice(['sales data', 'user profile', 'analytics'])}."
    chat_history.append({'user': user_input, 'bot': response})
    return response, None

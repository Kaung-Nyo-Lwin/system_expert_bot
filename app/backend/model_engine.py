from memory_store import chat_history
#import random
import os
import openai
import agent
import knowledge_graph_pipeline as pipeline
from docgen import create_pdf
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
    print("checking W.kg_viz:",w.kg_viz)
    nodes, edges = w.kg_viz
    
    #print(f"Parsing generated SQL query: {kg_viz}")
    return response, nodes, edges
#    
# kg = pipeline.load_kg_graphml('ourspace_sql_knowledge_graph')

# # async def generate_response(user_input):
# #     global kg
# #     response = await agent.answer_question(w, user_input)
# #     # response = f"The SQL retrieves {random.choice(['sales data', 'user profile', 'analytics'])}."
# #     chat_history.append({'user': user_input, 'bot': response})

# #     query_components = pipeline.parse_sql(user_input)
# #     kg, query_id = pipeline.update_kg_with_query(kg, query_components)
# #     nodes, edges = pipeline.extract_nodes_edges(kg, query_id)


# #     return response, nodes, edges


# # async def generate_response(user_input):
# #     global kg
# #     response = await agent.answer_question(w, user_input)
# #     chat_history.append({'user': user_input, 'bot': response})

# #     print(f"Parsing user query: {user_input}")
# #     query_components = pipeline.parse_sql(user_input)
# #     print(f"Parsed tables: {query_components.tables}")
# #     print(f"Parsed columns: {query_components.columns}")

# #     kg, query_id = pipeline.update_kg_with_query(kg, query_components)
# #     print(f"Created Query Node: {query_id}")

# #     nodes, edges = pipeline.extract_nodes_edges(kg, query_id)
# #     print(f"Extracted nodes: {len(nodes)}, edges: {len(edges)}")

# #     return response, nodes, edges

# async def generate_response(user_input):
#     global kg
#     response = await agent.answer_question(w,user_input)
#     chat_history.append({'user': user_input, 'bot': response})
    # kg_viz = w.kg_viz
    # print(f"Parsing generated SQL query: {kg_viz}")
    
    # print(f"Parsing generated SQL query: {user_input}")
    # query_components = pipeline.parse_sql(user_input)
    # print(f"Parsed tables: {query_components.tables}")
    # print(f"Parsed columns: {query_components.columns}")

    # kg, query_id = pipeline.update_kg_with_query(kg, query_components)
    # print(f"Created Query Node: {query_id}")

    # nodes, edges = pipeline.extract_nodes_edges(kg, query_id)
    # print(f"Extracted nodes: {len(nodes)}, edges: {len(edges)}")
    # print("Warning: No valid SQL query generated. Skipping graph generation.")
    # nodes, edges = [], []

    # # 🔥 Create PDF from response text
    # pdf_filename = create_pdf(response)
    # doc_path = f"static/docs/{pdf_filename}"

    # return response



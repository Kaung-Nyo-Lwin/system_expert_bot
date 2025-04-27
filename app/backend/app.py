from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS  # <- add this
from model_engine import generate_response
from docgen import create_doc
import os
import openai
import agent
import asyncio
from sql_model_pipeline import generate_sql, generate_explanation


app = Flask(__name__)
# CORS(app)  # <- allow all origins (React, etc.)
CORS(app)

app.config["UPLOAD_FOLDER"] = "static/docs"

@app.route("/api/message", methods=["POST"])
def chat():
    user_input = request.json["user_input"]

    if user_input.strip().lower() == "show graph":
        nodes = [
            {"id": 1, "label": "Node 1"},
            {"id": 2, "label": "Node 2"},
            {"id": 3, "label": "Node 3"}
        ]
        edges = [
            {"from": 1, "to": 2},
            {"from": 1, "to": 3}
        ]
        return jsonify({
            "response": "Here’s your graph visualization!",
            "nodes": nodes,
            "edges": edges,
            "doc_path": None
        })
    # nodes = []
    # edges = []

    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    response, nodes, edges = loop.run_until_complete(generate_response(user_input))
    print("Checking Responce",response)
    if response.replace("```markdown","").replace("```","").strip()== "Not enough information":
        nodes, edges = [], []
    doc_filename = create_doc(response)
    #nodes = [{"color": "#FFAAAA", "id": "query_7461764137375118208", "label": "Query", "shape": "box"}, {"color": "#AAAAFF", "id": "table_location", "label": "location", "shape": "dot"}, {"color": "#AAFFAA", "id": "column_museum_object.title", "label": "title\n(museum_object)", "shape": "dot"}, {"color": "#AAFFAA", "id": "column_museum_object.id", "label": "id\n(museum_object)", "shape": "dot"}, {"color": "#AAFFAA", "id": "column_attribute.art_style", "label": "art_style\n(attribute)", "shape": "dot"}, {"color": "#AAFFAA", "id": "column_location.country", "label": "country\n(location)", "shape": "dot"}, {"color": "#AAFFAA", "id": "column_attribute.object_id", "label": "object_id\n(attribute)", "shape": "dot"}, {"color": "#AAFFAA", "id": "column_location.id", "label": "id\n(location)", "shape": "dot"}, {"color": "#AAFFAA", "id": "column_attribute.material", "label": "material\n(attribute)", "shape": "dot"}, {"color": "#AAAAFF", "id": "table_attribute", "label": "attribute", "shape": "dot"}, {"color": "#AAAAFF", "id": "table_museum_object", "label": "museum_object", "shape": "dot"}]    # doc_filename = create_doc(user_input, response)
    #edges = [{"arows": "to", "color": "green", "from": "table_attribute", "label": "REFERENCES", "to": "table_museum_object"}, {"arrows": "to", "color": "red", "dashes": False, "from": "column_museum_object.id", "label": "JOINED_WITH", "to": "column_attribute.object_id"}, {"arrows": "to", "color": "blue", "from": "query_7461764137375118208", "label": "ACCESSES", "to": "table_location"}, {"arrows": "to", "color": "blue", "from": "query_7461764137375118208", "label": "ACCESSES", "to": "table_attribute"}, {"arrows": "to", "color": "blue", "from": "query_7461764137375118208", "label": "ACCESSES", "to": "table_museum_object"}, {"arrows": "to", "color": "green", "from": "query_7461764137375118208", "label": "REFERENCES", "to": "column_location.country"}, {"arrows": "to", "color": "green", "from": "query_7461764137375118208", "label": "REFERENCES", "to": "column_attribute.art_style"}, {"arrows": "to", "color": "green", "from": "query_7461764137375118208", "label": "REFERENCES", "to": "column_attribute.material"}, {"arrows": "to", "color": "green", "from": "query_7461764137375118208", "label": "REFERENCES", "to": "column_location.id"}, {"arrows": "to", "color": "green", "from": "query_7461764137375118208", "label": "REFERENCES", "to": "column_attribute.object_id"}, {"arrows": "to", "color": "green", "from": "query_7461764137375118208", "label": "REFERENCES", "to": "column_museum_object.id"}, {"arrows": "to", "color": "green", "from": "query_7461764137375118208", "label": "REFERENCES", "to": "column_museum_object.title"}]
    
    return jsonify({
        "response": response,
        "nodes": nodes,
        "edges": edges,
        
        "doc_path": f"static/docs/{doc_filename}" if response else None
    })

# ================= NEW ENDPOINT 1 =================
@app.route("/api/generate-sql", methods=["POST"])
def api_generate_sql():
    data = request.json
    question = data.get("question", "")
    schema_context = data.get("schema", "")

    if not question or not schema_context:
        return jsonify({"error": "Question and schema context required."}), 400

    try:
        sql_query = generate_sql(question, schema_context)
        return jsonify({"output": sql_query})
    except Exception as e:
        print(f"Error generating SQL: {e}")
        return jsonify({"error": str(e)}), 500 
# ================= NEW ENDPOINT 2 =================


@app.route("/api/generate-explanation", methods=["POST"])
def api_generate_explanation():

    data = request.json
    schema = data.get("schema", "")
    question = data.get("question", "")
    sql_query = data.get("query", "")

    if not schema or not question or not sql_query:
        return jsonify({"error": "Schema, question, and SQL query required."}), 400

    try:
        explanation = generate_explanation(schema, question, sql_query)
        return jsonify({"output": explanation})
    except Exception as e:
        print(f"Error generating explanation: {e}")
        return jsonify({"error": str(e)}), 500
if __name__ == "__main__":
    app.run(debug=True, port=8000)


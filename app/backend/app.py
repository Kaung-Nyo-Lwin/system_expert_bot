# from flask import Flask, request, jsonify, send_from_directory
# from flask_cors import CORS  # <- add this
# from model_engine import generate_response
# # from docgen import create_doc
# import os
# import openai
# import agent
# import asyncio
# from docgen import create_pdf 

# app = Flask(__name__)
# # CORS(app)  # <- allow all origins (React, etc.)
# CORS(app)

# app.config["UPLOAD_FOLDER"] = "static/docs"

# @app.route("/api/message", methods=["POST"])
# def chat():
#     user_input = request.json["user_input"]

#     if user_input.strip().lower() == "show graph":
#         nodes = [
#             {"id": 1, "label": "Node 1"},
#             {"id": 2, "label": "Node 2"},
#             {"id": 3, "label": "Node 3"}
#         ]
#         edges = [
#             {"from": 1, "to": 2},
#             {"from": 1, "to": 3}
#         ]
#         return jsonify({
#             "response": "Here’s your graph visualization!",
#             "nodes": nodes,
#             "edges": edges,
#             "doc_path": None
#         })

#     loop = asyncio.new_event_loop()
#     asyncio.set_event_loop(loop)
#     response, nodes, edges = loop.run_until_complete(generate_response(user_input))
#     # if response:
#     #     doc_filename = create_pdf(response)
#     # else:
#     #     doc_filename = None
#     #doc_filename = create_doc(user_input, response)
#     #nodes = [{"color": "#FFAAAA", "id": "query_7461764137375118208", "label": "Query", "shape": "box"}, {"color": "#AAAAFF", "id": "table_location", "label": "location", "shape": "dot"}, {"color": "#AAFFAA", "id": "column_museum_object.title", "label": "title\n(museum_object)", "shape": "dot"}, {"color": "#AAFFAA", "id": "column_museum_object.id", "label": "id\n(museum_object)", "shape": "dot"}, {"color": "#AAFFAA", "id": "column_attribute.art_style", "label": "art_style\n(attribute)", "shape": "dot"}, {"color": "#AAFFAA", "id": "column_location.country", "label": "country\n(location)", "shape": "dot"}, {"color": "#AAFFAA", "id": "column_attribute.object_id", "label": "object_id\n(attribute)", "shape": "dot"}, {"color": "#AAFFAA", "id": "column_location.id", "label": "id\n(location)", "shape": "dot"}, {"color": "#AAFFAA", "id": "column_attribute.material", "label": "material\n(attribute)", "shape": "dot"}, {"color": "#AAAAFF", "id": "table_attribute", "label": "attribute", "shape": "dot"}, {"color": "#AAAAFF", "id": "table_museum_object", "label": "museum_object", "shape": "dot"}]    # doc_filename = create_doc(user_input, response)
#     #edges = [{"arrows": "to", "color": "green", "from": "table_attribute", "label": "REFERENCES", "to": "table_museum_object"}, {"arrows": "to", "color": "red", "dashes": False, "from": "column_museum_object.id", "label": "JOINED_WITH", "to": "column_attribute.object_id"}, {"arrows": "to", "color": "blue", "from": "query_7461764137375118208", "label": "ACCESSES", "to": "table_location"}, {"arrows": "to", "color": "blue", "from": "query_7461764137375118208", "label": "ACCESSES", "to": "table_attribute"}, {"arrows": "to", "color": "blue", "from": "query_7461764137375118208", "label": "ACCESSES", "to": "table_museum_object"}, {"arrows": "to", "color": "green", "from": "query_7461764137375118208", "label": "REFERENCES", "to": "column_location.country"}, {"arrows": "to", "color": "green", "from": "query_7461764137375118208", "label": "REFERENCES", "to": "column_attribute.art_style"}, {"arrows": "to", "color": "green", "from": "query_7461764137375118208", "label": "REFERENCES", "to": "column_attribute.material"}, {"arrows": "to", "color": "green", "from": "query_7461764137375118208", "label": "REFERENCES", "to": "column_location.id"}, {"arrows": "to", "color": "green", "from": "query_7461764137375118208", "label": "REFERENCES", "to": "column_attribute.object_id"}, {"arrows": "to", "color": "green", "from": "query_7461764137375118208", "label": "REFERENCES", "to": "column_museum_object.id"}, {"arrows": "to", "color": "green", "from": "query_7461764137375118208", "label": "REFERENCES", "to": "column_museum_object.title"}]
#     #nodes = []
#     #edges = []
#     return jsonify({
#         "response": response,
#         "nodes": nodes,
#         "edges": edges,
#         "doc_path":  f"static/docs/{response}" if response else None
#     })
    

# @app.route("/static/docs/<path:filename>")
# def download_file(filename):
#     return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

# if __name__ == "__main__":
#     app.run(debug=True, port=8000)


# # from flask import Flask, request, jsonify, send_from_directory
# # from flask_cors import CORS
# # from model_engine import generate_response
# # import asyncio

# # app = Flask(__name__)
# # CORS(app)
# # app.config["UPLOAD_FOLDER"] = "static/docs"

# # @app.route("/api/message", methods=["POST"])
# # def chat():
# #     user_input = request.json["user_input"]

# #     loop = asyncio.new_event_loop()
# #     asyncio.set_event_loop(loop)
# #     response, nodes, edges, doc_path = loop.run_until_complete(generate_response(user_input))

# #     return jsonify({
# #         "response": response,
# #         "nodes": nodes,
# #         "edges": edges,
# #         "doc_path": doc_path
# #     })

# # @app.route("/static/docs/<path:filename>")
# # def download_file(filename):
# #     return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

# # if __name__ == "__main__":
# #     app.run(debug=True, port=8000)



from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS  # <- add this
from model_engine import generate_response
# from docgen import create_doc
import os
import openai
import agent
import asyncio


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
    nodes = []
    edges = []

    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    response, nodes, edges= loop.run_until_complete(generate_response(user_input))
    
    #doc_filename = create_doc(user_input, response)
    #nodes = [{"color": "#FFAAAA", "id": "query_7461764137375118208", "label": "Query", "shape": "box"}, {"color": "#AAAAFF", "id": "table_location", "label": "location", "shape": "dot"}, {"color": "#AAFFAA", "id": "column_museum_object.title", "label": "title\n(museum_object)", "shape": "dot"}, {"color": "#AAFFAA", "id": "column_museum_object.id", "label": "id\n(museum_object)", "shape": "dot"}, {"color": "#AAFFAA", "id": "column_attribute.art_style", "label": "art_style\n(attribute)", "shape": "dot"}, {"color": "#AAFFAA", "id": "column_location.country", "label": "country\n(location)", "shape": "dot"}, {"color": "#AAFFAA", "id": "column_attribute.object_id", "label": "object_id\n(attribute)", "shape": "dot"}, {"color": "#AAFFAA", "id": "column_location.id", "label": "id\n(location)", "shape": "dot"}, {"color": "#AAFFAA", "id": "column_attribute.material", "label": "material\n(attribute)", "shape": "dot"}, {"color": "#AAAAFF", "id": "table_attribute", "label": "attribute", "shape": "dot"}, {"color": "#AAAAFF", "id": "table_museum_object", "label": "museum_object", "shape": "dot"}]    # doc_filename = create_doc(user_input, response)
    #edges = [{"arrows": "to", "color": "green", "from": "table_attribute", "label": "REFERENCES", "to": "table_museum_object"}, {"arrows": "to", "color": "red", "dashes": False, "from": "column_museum_object.id", "label": "JOINED_WITH", "to": "column_attribute.object_id"}, {"arrows": "to", "color": "blue", "from": "query_7461764137375118208", "label": "ACCESSES", "to": "table_location"}, {"arrows": "to", "color": "blue", "from": "query_7461764137375118208", "label": "ACCESSES", "to": "table_attribute"}, {"arrows": "to", "color": "blue", "from": "query_7461764137375118208", "label": "ACCESSES", "to": "table_museum_object"}, {"arrows": "to", "color": "green", "from": "query_7461764137375118208", "label": "REFERENCES", "to": "column_location.country"}, {"arrows": "to", "color": "green", "from": "query_7461764137375118208", "label": "REFERENCES", "to": "column_attribute.art_style"}, {"arrows": "to", "color": "green", "from": "query_7461764137375118208", "label": "REFERENCES", "to": "column_attribute.material"}, {"arrows": "to", "color": "green", "from": "query_7461764137375118208", "label": "REFERENCES", "to": "column_location.id"}, {"arrows": "to", "color": "green", "from": "query_7461764137375118208", "label": "REFERENCES", "to": "column_attribute.object_id"}, {"arrows": "to", "color": "green", "from": "query_7461764137375118208", "label": "REFERENCES", "to": "column_museum_object.id"}, {"arrows": "to", "color": "green", "from": "query_7461764137375118208", "label": "REFERENCES", "to": "column_museum_object.title"}]
    
    return jsonify({
        "response": response,
        "nodes": nodes,
        "edges": edges,
        
        "doc_path": f"static/docs/{response}" if response else None
    })

@app.route("/static/docs/<path:filename>")
def download_file(filename):
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

if __name__ == "__main__":
    app.run(debug=True, port=8000)


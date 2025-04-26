from flask import Flask, request, jsonify, send_from_directory
from model_engine import generate_response
from docgen import create_doc
import os

app = Flask(__name__)
app.config["UPLOAD_FOLDER"] = "static/docs"

@app.route("/api/message", methods=["POST"])
def chat():
    user_input = request.json["user_input"]
    response, _ = generate_response(user_input)
    doc_filename = create_doc(user_input, response)
    return jsonify({
        "response": response,
        "doc_path": f"static/docs/{doc_filename}" if doc_filename else None
    })

@app.route("/static/docs/<path:filename>")
def download_file(filename):
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

if __name__ == "__main__":
    app.run(debug=True, port=8000)

"""HTTP boundary for the local demo and opt-in research models."""
import asyncio
import json
import os
from pathlib import Path

from dotenv import load_dotenv
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from werkzeug.exceptions import HTTPException

from .analysis import analyze_sql, parse_schema
from .docgen import create_doc
from .errors import ServiceUnavailable

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR.parents[1] / ".env")
EXAMPLES = json.loads((BASE_DIR / "examples.json").read_text())


def normalize(value):
    return " ".join(value.casefold().rstrip("?.!").split())


def create_app(config=None):
    app = Flask(__name__, static_folder=None)
    app.config.from_mapping(
        APP_MODE=os.getenv("APP_MODE", "demo"),
        DOCS_DIR=BASE_DIR / "static" / "docs",
        MAX_CONTENT_LENGTH=64 * 1024,
    )
    if config:
        app.config.update(config)
    if app.config["APP_MODE"] not in {"demo", "live"}:
        raise ValueError("APP_MODE must be demo or live.")
    origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
    CORS(app, resources={r"/api/*": {"origins": origins.split(",")}})

    def payload(*fields):
        data = request.get_json(silent=True)
        if not isinstance(data, dict):
            raise ValueError("Send a JSON object with the required fields.")
        for field in fields:
            if not isinstance(data.get(field), str) or not data[field].strip():
                raise ValueError(f"{field.capitalize()} is required and must be text.")
            if len(data[field]) > 20000:
                raise ValueError(f"{field.capitalize()} must be under 20,000 characters.")
        return {field: data[field].strip() for field in fields}

    def run_live(function, *args):
        try:
            return function(*args)
        except (ImportError, FileNotFoundError) as exc:
            raise ServiceUnavailable(
                "Live models are not configured. See docs/SETUP.md or use APP_MODE=demo."
            ) from exc

    @app.get("/api/health")
    def health():
        return jsonify(status="ok", mode=app.config["APP_MODE"], version="2.0.0")

    @app.get("/api/examples")
    def examples():
        return jsonify(examples=EXAMPLES)

    @app.post("/api/message")
    def message():
        data = payload("user_input")
        if app.config["APP_MODE"] == "demo":
            example = next((item for item in EXAMPLES if normalize(item["question"]) == normalize(data["user_input"])), None)
            if example is None:
                return jsonify(error="Choose one of the three sample questions in demo mode. For your own SQL, use SQL explainer."), 422
            analysis = analyze_sql(example["schema"], example["query"])
            response = example["explanation"]
            nodes, edges = analysis["nodes"], analysis["edges"]
            sources = example["sources"]
        else:
            def answer():
                from .model_engine import generate_response
                return asyncio.run(generate_response(data["user_input"]))
            response, nodes, edges = run_live(answer)
            sources = []
        filename = create_doc(response, app.config["DOCS_DIR"])
        return jsonify(response=response, nodes=nodes, edges=edges, sources=sources,
                       doc_path=f"/api/documents/{filename}", mode=app.config["APP_MODE"])

    @app.post("/api/generate-sql")
    def generate_sql():
        data = payload("question", "schema")
        if app.config["APP_MODE"] == "demo":
            example = next((item for item in EXAMPLES if normalize(item["question"]) == normalize(data["question"])), None)
            if example is None or parse_schema(data["schema"]) != parse_schema(example["schema"]):
                return jsonify(error="Demo generation uses the three bundled question/schema pairs. Load a sample, or configure the T5 checkpoint for live generation."), 422
            output = example["query"]
        else:
            def generate():
                from .sql_model_pipeline import generate_sql as model_generate
                return model_generate(data["question"], data["schema"])
            output = run_live(generate)
        return jsonify(output=output, mode=app.config["APP_MODE"])

    @app.post("/api/generate-explanation")
    def generate_explanation():
        data = payload("schema", "question", "query")
        if app.config["APP_MODE"] == "demo":
            result = analyze_sql(data["schema"], data["query"])
        else:
            def explain():
                from .sql_model_pipeline import generate_explanation as model_explain
                return model_explain(data["schema"], data["question"], data["query"])
            result = {"output": run_live(explain), "nodes": [], "edges": []}
        filename = create_doc(result["output"], app.config["DOCS_DIR"])
        return jsonify(**result, doc_path=f"/api/documents/{filename}", mode=app.config["APP_MODE"])

    @app.get("/api/documents/<filename>")
    def document(filename):
        if not filename.endswith(".docx"):
            return jsonify(error="Document not found."), 404
        return send_from_directory(app.config["DOCS_DIR"], filename, as_attachment=True)

    @app.errorhandler(ValueError)
    def invalid_input(error):
        return jsonify(error=str(error)), 400

    @app.errorhandler(ServiceUnavailable)
    def unavailable(error):
        return jsonify(error=str(error)), 503

    @app.errorhandler(HTTPException)
    def http_error(error):
        return jsonify(error=error.description), error.code

    @app.errorhandler(Exception)
    def unexpected(error):
        app.logger.exception("Request failed")
        return jsonify(error="The request could not be completed. Check the server logs and model configuration."), 500

    return app


app = create_app()

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=int(os.getenv("PORT", "8000")), debug=False)

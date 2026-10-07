"""Regression coverage for the actual public API and parser behavior."""

from io import BytesIO
import sys
from zipfile import ZipFile

import pytest

from app.backend.analysis import analyze_sql, parse_schema
from app.backend.app import EXAMPLES, create_app
from app.backend.docgen import create_doc


@pytest.fixture
def client(tmp_path):
    return create_app({"TESTING": True, "APP_MODE": "demo", "DOCS_DIR": tmp_path}).test_client()


def test_demo_starts_without_models_or_keys(client, monkeypatch):
    monkeypatch.delenv("GROQ_API_KEY", raising=False)
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    assert client.get("/api/health").json["mode"] == "demo"
    assert "transformers" not in sys.modules
    assert "app.backend.agent" not in sys.modules
    assert len(client.get("/api/examples").json["examples"]) == 3


@pytest.mark.parametrize("example", EXAMPLES, ids=lambda item: item["id"])
def test_samples_support_chat_generation_and_analysis(client, example):
    chat = client.post("/api/message", json={"user_input": example["question"]})
    assert chat.status_code == 200
    assert chat.json["mode"] == "demo"
    assert chat.json["sources"] == example["sources"]
    assert chat.json["nodes"] and chat.json["edges"]
    ids = {node["id"] for node in chat.json["nodes"]}
    assert all(edge["from"] in ids and edge["to"] in ids for edge in chat.json["edges"])
    generated = client.post("/api/generate-sql", json={"question": example["question"], "schema": example["schema"]})
    assert generated.status_code == 200
    assert generated.json["output"] == example["query"]
    explained = client.post("/api/generate-explanation", json={key: example[key] for key in ("question", "schema", "query")})
    assert explained.status_code == 200
    assert "structural explanation" in explained.json["output"]
    assert client.get(explained.json["doc_path"]).status_code == 200


@pytest.mark.parametrize("payload", [None, [], "text", {}, {"user_input": 3}, {"user_input": "  "}, {"user_input": "x" * 20001}])
def test_malformed_requests_return_json_errors(client, payload):
    response = client.post("/api/message", json=payload)
    assert response.status_code == 400
    assert response.json["error"]


def test_malformed_json_and_size_limit(client):
    assert client.post("/api/message", data="{broken", content_type="application/json").status_code == 400
    response = client.post("/api/message", json={"user_input": "x" * 70000})
    assert response.status_code == 413
    assert response.is_json


def test_demo_does_not_invent_answers_for_unrecognized_input(client):
    response = client.post("/api/message", json={"user_input": "Predict tomorrow's sales"})
    assert response.status_code == 422
    assert "sample" in response.json["error"]
    response = client.post("/api/generate-sql", json={"question": EXAMPLES[0]["question"], "schema": "CREATE TABLE different (id INT);"})
    assert response.status_code == 422


def test_exports_are_unique_unicode_documents(client, tmp_path):
    first = create_doc("## Revenue — ရငွေ\n€100 → completed", tmp_path)
    second = create_doc("Another response", tmp_path)
    assert first != second
    with ZipFile(tmp_path / first) as document:
        text = document.read("word/document.xml").decode()
    assert "ရငွေ" in text and "€100" in text
    response = client.post("/api/message", json={"user_input": EXAMPLES[0]["question"]})
    download = client.get(response.json["doc_path"])
    assert "attachment" in download.headers["Content-Disposition"]
    assert "word/document.xml" in ZipFile(BytesIO(download.data)).namelist()
    assert client.get("/api/documents/../app.py").status_code == 404
    assert client.get("/api/documents/missing.docx").status_code == 404


def test_live_mode_with_missing_credentials_is_actionable(tmp_path, monkeypatch):
    monkeypatch.setenv("LLM_PROVIDER", "groq")
    monkeypatch.delenv("GROQ_API_KEY", raising=False)
    client = create_app({"TESTING": True, "APP_MODE": "live", "DOCS_DIR": tmp_path}).test_client()
    response = client.post("/api/message", json={"user_input": "Explain bookings"})
    assert response.status_code == 503
    assert "GROQ_API_KEY" in response.json["error"]


def test_unexpected_errors_do_not_disclose_internal_details(client, monkeypatch):
    def broken(*args):
        raise RuntimeError("private internal path")
    monkeypatch.setattr("app.backend.app.create_doc", broken)
    response = client.post("/api/message", json={"user_input": EXAMPLES[0]["question"]})
    assert response.status_code == 500
    assert "private internal path" not in response.get_data(as_text=True)


def test_cors_allows_only_configured_origins(client):
    allowed = client.get("/api/health", headers={"Origin": "http://localhost:5173"})
    blocked = client.get("/api/health", headers={"Origin": "https://unrelated.example"})
    assert allowed.headers["Access-Control-Allow-Origin"] == "http://localhost:5173"
    assert "Access-Control-Allow-Origin" not in blocked.headers


def test_analysis_uses_real_aliases_and_clauses():
    result = analyze_sql("CREATE TABLE booking (id INT, total DECIMAL(10,2), status VARCHAR(20));",
                         "SELECT b.status, SUM(b.total) AS revenue FROM booking b WHERE b.total > 10 GROUP BY b.status HAVING SUM(b.total) > 50 ORDER BY revenue DESC LIMIT 5 OFFSET 2;")
    assert result["tables"] == ["booking"]
    for clause in ["b.total > 10", "Group rows", "SUM(b.total) > 50", "revenue DESC", "`5`", "`2`"]:
        assert clause in result["output"]
    assert {node["id"] for node in result["nodes"]} == {"query", "table:booking", "column:booking.status", "column:booking.total"}


def test_schema_parser_accepts_comments_and_table_constraints():
    schema = parse_schema("-- a comment\nCREATE TABLE t (id INT PRIMARY KEY, name VARCHAR(100));")
    assert schema == {"t": {"id": "INT", "name": "VARCHAR(100)"}}


@pytest.mark.parametrize("query", [
    "DROP TABLE t;", "UPDATE t SET id = 1;", "SELECT id FROM t; DELETE FROM t;",
    "SELECT * FROM (SELECT * FROM t) q;", "WITH c AS (SELECT * FROM t) SELECT * FROM c;",
    "SELECT id FROM missing;", "SELECT t.missing FROM t;", "SELECT missing FROM t;",
    "SELECT nope.id FROM t;", "SELECT id INTO other FROM t;", "SELECT FROM", "SELECT",
])
def test_unsupported_or_invalid_sql_is_rejected(query):
    with pytest.raises(ValueError):
        analyze_sql("CREATE TABLE t (id INT);", query)


def test_ambiguous_columns_do_not_gain_invented_lineage():
    result = analyze_sql("CREATE TABLE a (id INT); CREATE TABLE b (id INT);", "SELECT id FROM a JOIN b ON a.id = b.id;")
    assert len([node for node in result["nodes"] if node["group"] == "column"]) == 2
    assert all(node["id"] != "column:None.id" for node in result["nodes"])


@pytest.mark.parametrize("schema", ["", "DROP TABLE t;", "CREATE TABLE t AS SELECT 1;", "CREATE VIEW v(id) AS SELECT 1;", "CREATE TABLE t (id INT); CREATE TABLE t (other INT);"])
def test_invalid_schema_is_rejected(schema):
    with pytest.raises(ValueError):
        parse_schema(schema)

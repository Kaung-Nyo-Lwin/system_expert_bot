import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useApp } from "../lib/context";
import { apiUrl, request } from "../lib/api";
import Icon from "../components/Icon";
import GraphPanel from "../components/GraphPanel";

export default function SqlWorkspace({ mode }) {
  const { examples, status, mode: serverMode } = useApp();
  const explain = mode === "explain";
  const [question, setQuestion] = useState("");
  const [schema, setSchema] = useState("");
  const [query, setQuery] = useState("");
  const [sampleId, setSampleId] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const busy = useRef(false);
  const isDemo = serverMode === "demo";
  function loadSample(id) {
    const example = examples.find((item) => item.id === id);
    setSampleId(id);
    if (!example) return;
    setQuestion(example.question);
    setSchema(example.schema);
    setQuery(example.query);
    setResult(null);
    setError("");
    setCopied(false);
  }
  function change(setter, value) {
    setter(value);
    setResult(null);
    setError("");
    setCopied(false);
    setSampleId("");
  }
  async function submit(event) {
    event.preventDefault();
    if (busy.current || !question.trim() || !schema.trim() || (explain && !query.trim())) return;
    busy.current = true;
    setLoading(true);
    setError("");
    setResult(null);
    setCopied(false);
    try {
      const data = await request(explain ? "/api/generate-explanation" : "/api/generate-sql", {
        question,
        schema,
        ...(explain ? { query } : {}),
      });
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      busy.current = false;
      setLoading(false);
    }
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(result.output);
      setCopied(true);
    } catch {
      setError("Clipboard access is unavailable. Select and copy the result directly.");
    }
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            {explain ? "MAKE EVERY CLAUSE MAKE SENSE" : "FROM INTENT TO IMPLEMENTATION"}
          </span>
          <h1>{explain ? "Read between the lines." : "A question. A schema. A query."}</h1>
          <p>
            {explain
              ? "Unpack the structure of a SELECT query, one step at a time."
              : "Explore how business questions translate into SQL."}
          </p>
        </div>
        <span className="subtle-tag large">
          {serverMode === "live"
            ? explain
              ? "TinyLlama"
              : "T5"
            : explain
              ? "Local SQL parser"
              : "Sample query library"}
        </span>
      </div>
      <div className="workspace-grid sql-layout">
        <form className="panel editor-panel" onSubmit={submit}>
          <div className="panel-heading">
            <span>
              <Icon name="code" size={17} /> {explain ? "Query workspace" : "Query inputs"}
            </span>
            <span className="subtle-tag">MySQL</span>
          </div>
          <div className="editor-body">
            <div className="sample-select">
              <label htmlFor="sample">START WITH AN EXAMPLE</label>
              <select
                id="sample"
                value={sampleId}
                disabled={loading || status !== "ready"}
                onChange={(event) => loadSample(event.target.value)}
              >
                <option value="">Choose a sample…</option>
                {examples.map((example) => (
                  <option key={example.id} value={example.id}>
                    {example.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="question">
                <span className="field-number">01</span>Business question
              </label>
              <input
                id="question"
                value={question}
                onChange={(event) => change(setQuestion, event.target.value)}
                placeholder="What would you like to understand?"
                required
                maxLength={20000}
                disabled={loading}
              />
            </div>
            <div className="field">
              <label htmlFor="schema">
                <span className="field-number">02</span>Database schema{" "}
                <span>CREATE TABLE statements</span>
              </label>
              <textarea
                className="code-input"
                id="schema"
                rows={explain ? 7 : 14}
                value={schema}
                onChange={(event) => change(setSchema, event.target.value)}
                placeholder={
                  "CREATE TABLE booking (\n  id INT PRIMARY KEY,\n  total DECIMAL(10,2)\n);"
                }
                required
                maxLength={20000}
                spellCheck="false"
                disabled={loading}
              />
            </div>
            {explain && (
              <div className="field">
                <label htmlFor="query">
                  <span className="field-number">03</span>SQL query <span>Single SELECT</span>
                </label>
                <textarea
                  className="code-input"
                  id="query"
                  rows={8}
                  value={query}
                  onChange={(event) => change(setQuery, event.target.value)}
                  placeholder="SELECT SUM(total) FROM booking;"
                  required
                  maxLength={20000}
                  spellCheck="false"
                  disabled={loading}
                />
              </div>
            )}
            {error && (
              <div className="inline-error" role="alert">
                {error}
              </div>
            )}
            <button
              className="button primary full-width"
              disabled={
                loading ||
                status !== "ready" ||
                !question.trim() ||
                !schema.trim() ||
                (explain && !query.trim())
              }
              type="submit"
            >
              {loading ? (
                <>
                  <span className="spinner" /> Working…
                </>
              ) : (
                <>
                  {explain ? "Explain query" : isDemo ? "Show sample SQL" : "Generate SQL"}
                  <Icon name="arrow" size={18} />
                </>
              )}
            </button>
            <p className="field-help">
              {isDemo
                ? explain
                  ? "Parsed locally. Supports joins, filters, grouping, and ordering. No SQL is executed."
                  : "Demo mode returns prepared SQL for the bundled question/schema pairs."
                : "Research model output. Review before using it in your own system."}
            </p>
          </div>
        </form>
        <div className="result-column">
          <section className="panel result-panel" aria-busy={loading}>
            <div className="panel-heading">
              <span>
                <Icon name={explain ? "document" : "code"} size={17} />{" "}
                {explain ? "The explanation" : "Your SQL"}
              </span>
              {result && (
                <button className="text-button" type="button" onClick={copy}>
                  <Icon name={copied ? "check" : "copy"} size={14} />
                  {copied ? "Copied" : "Copy"}
                </button>
              )}
            </div>
            {loading ? (
              <div className="result-empty" role="status">
                <span className="spinner" />
                <h3>Following the logic…</h3>
                <p>Preparing the result for your query.</p>
              </div>
            ) : result ? (
              <div className="result-content">
                <div className="result-status">
                  <Icon name="check" size={15} />{" "}
                  {result.mode === "demo"
                    ? explain
                      ? "Parsed from your SQL"
                      : "Prepared sample query"
                    : "Model-generated result"}
                </div>
                {explain ? (
                  <div className="markdown">
                    <ReactMarkdown>{result.output}</ReactMarkdown>
                  </div>
                ) : (
                  <pre className="sql-output">
                    <code>{result.output}</code>
                  </pre>
                )}
                {result.doc_path && (
                  <a className="download-link" href={apiUrl(result.doc_path)} download>
                    <Icon name="download" size={15} />
                    Download documentation (.docx)
                  </a>
                )}
              </div>
            ) : (
              <div className="result-empty">
                <span className="empty-result-icon">
                  <Icon name={explain ? "document" : "code"} size={32} />
                </span>
                <h3>{explain ? "Clarity starts here." : "Give your question some context."}</h3>
                <p>
                  {explain
                    ? "Add your schema and query, or load an example. We'll map out what each part does."
                    : "Load a sample to see its schema and explore the SQL that answers the question."}
                </p>
                <span className="empty-result-line" />
              </div>
            )}
          </section>
          {result?.nodes?.length > 0 && <GraphPanel nodes={result.nodes} edges={result.edges} />}
          <div className="context-note small-note">
            <Icon name="book" size={21} />
            <div>
              <h3>
                {explain ? "Structure is the starting point." : "A schema makes the difference."}
              </h3>
              <p>
                {explain
                  ? "The local explainer describes SQL structure. It does not check whether a query answers the business question correctly."
                  : "Table and column names provide the context a model needs to produce a relevant query."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

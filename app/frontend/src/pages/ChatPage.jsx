import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useApp } from "../lib/context";
import { apiUrl, REPOSITORY, request } from "../lib/api";
import Icon from "../components/Icon";
import GraphPanel from "../components/GraphPanel";

export default function ChatPage() {
  const { examples, status, mode } = useApp();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bodyRef = useRef(null);
  const answerRef = useRef(null);
  const busy = useRef(false);
  const latest = [...messages].reverse().find((message) => message.nodes?.length);
  useEffect(() => {
    const body = bodyRef.current;
    const answer = answerRef.current;
    if (body && answer) {
      body.scrollTo({
        top:
          body.scrollTop +
          answer.getBoundingClientRect().top -
          body.getBoundingClientRect().top -
          20,
        behavior: "smooth",
      });
    }
  }, [messages.length]);

  async function send(value = input) {
    if (!value.trim() || busy.current || status !== "ready") return;
    busy.current = true;
    setLoading(true);
    setError("");
    setInput(value);
    try {
      const data = await request("/api/message", { user_input: value.trim() });
      setMessages((previous) => [
        ...previous,
        { role: "user", response: value },
        { role: "assistant", ...data },
      ]);
      setInput("");
    } catch (err) {
      setError(err.message);
    } finally {
      busy.current = false;
      setLoading(false);
    }
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">A CONVERSATION WITH CONTEXT</span>
          <h1>Ask your database.</h1>
          <p>Explore the business logic behind the OurSpace booking system.</p>
        </div>
        <button
          className="button secondary compact"
          disabled={!messages.length || loading}
          onClick={() => {
            setMessages([]);
            setError("");
            setInput("");
          }}
        >
          <Icon name="refresh" size={16} /> New conversation
        </button>
      </div>
      <div className="workspace-grid chat-layout">
        <section className="panel conversation-panel">
          <div className="panel-heading">
            <span>
              <span className="status-dot" /> OurSpace assistant
            </span>
            <span className="subtle-tag">
              {mode === "live" ? "Research models" : "Guided demo"}
            </span>
          </div>
          <div className="conversation-body" ref={bodyRef}>
            {!messages.length && (
              <div className="chat-welcome">
                <span className="welcome-icon">
                  <Icon name="chat" size={30} />
                </span>
                <span className="eyebrow">START WITH A GOOD QUESTION</span>
                <h2>What would you like to understand?</h2>
                <p>
                  {mode === "live"
                    ? "Ask about the bundled OurSpace schema and procedures."
                    : "Pick a sample question to follow the logic from a business need to the tables behind it."}
                </p>
                <div className="prompt-list">
                  {examples.map((example) => (
                    <button
                      key={example.id}
                      disabled={loading || status !== "ready"}
                      onClick={() => send(example.question)}
                    >
                      <span>
                        <small>{example.category}</small>
                        {example.question}
                      </span>
                      <Icon name="arrow" size={18} />
                    </button>
                  ))}
                </div>
                {status !== "ready" && (
                  <p className="muted">
                    {status === "loading"
                      ? "Loading sample questions…"
                      : "Connect the API to load sample questions."}
                  </p>
                )}
              </div>
            )}
            {messages.map((message, index) => (
              <article
                key={index}
                className={`message ${message.role}`}
                ref={index === messages.length - 1 ? answerRef : undefined}
              >
                <span className="message-avatar">
                  {message.role === "user" ? "You" : <Icon name="code" size={17} />}
                </span>
                <div className="message-content">
                  <span className="message-label">
                    {message.role === "user" ? "YOU" : "SOFTWAREDOCBOT"}
                    {message.role === "assistant" && (
                      <span>{message.mode === "demo" ? "Prepared example" : "Model response"}</span>
                    )}
                  </span>
                  <div className="markdown">
                    <ReactMarkdown>{message.response}</ReactMarkdown>
                  </div>
                  {message.sources?.length > 0 && (
                    <div className="source-list">
                      <span>Source material</span>
                      {message.sources.map((source) => (
                        <a
                          key={source}
                          href={`${REPOSITORY}/blob/main/app/backend/ourspace/${source}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Icon name="document" size={13} />
                          {source}
                          <Icon name="external" size={11} />
                        </a>
                      ))}
                    </div>
                  )}
                  {message.doc_path && (
                    <a className="download-link" href={apiUrl(message.doc_path)} download>
                      <Icon name="download" size={15} /> Download documentation (.docx)
                    </a>
                  )}
                </div>
              </article>
            ))}
            {loading && (
              <div className="loading-state" role="status">
                <span className="spinner" /> Preparing your explanation…
              </div>
            )}
          </div>
          <form
            className="composer"
            onSubmit={(event) => {
              event.preventDefault();
              send();
            }}
          >
            {error && (
              <div className="inline-error" role="alert">
                {error}
              </div>
            )}
            <div className="composer-field">
              <label className="sr-only" htmlFor="chat-input">
                Your question
              </label>
              <input
                id="chat-input"
                placeholder={
                  mode === "live"
                    ? "Ask about your software system…"
                    : "Choose a sample question above, or paste one here…"
                }
                value={input}
                onChange={(event) => setInput(event.target.value)}
                maxLength={20000}
                disabled={loading}
              />
              <button
                type="submit"
                aria-label="Send question"
                disabled={!input.trim() || loading || status !== "ready"}
              >
                <Icon name="arrow" size={20} />
              </button>
            </div>
            <p>
              {mode === "live"
                ? "Answers use the bundled schema and procedures. Review generated explanations."
                : "Demo answers are prepared examples. Try SQL explainer for your own query."}
            </p>
          </form>
        </section>
        <aside className="context-column">
          {latest ? (
            <GraphPanel nodes={latest.nodes} edges={latest.edges} />
          ) : (
            <section className="panel graph-placeholder">
              <div className="panel-heading">
                <span>
                  <Icon name="graph" size={17} /> Query relationships
                </span>
              </div>
              <div className="empty-graph">
                <div className="placeholder-nodes">
                  <i />
                  <i />
                  <i />
                  <span />
                </div>
                <h3>See how it connects.</h3>
                <p>Your query's tables and columns will appear here after an answer.</p>
              </div>
            </section>
          )}
          <section className="context-note">
            <span className="eyebrow">WHY THE GRAPH MATTERS</span>
            <h3>Every answer has a structure.</h3>
            <p>
              Trace which tables a query reads and which columns it references. The demo graph is
              built from parsed SQL.
            </p>
            <div className="context-divider" />
            <span className="tiny-label">SAMPLE DOMAIN</span>
            <p>Space rentals, bookings, and customer activity in the OurSpace system.</p>
          </section>
        </aside>
      </div>
    </>
  );
}

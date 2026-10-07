import { Link } from "react-router-dom";
import Icon from "../components/Icon";
import { REPOSITORY } from "../lib/api";

export default function LandingPage() {
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">DATABASE INTELLIGENCE, MADE HUMAN</span>
          <h1>A little context changes everything.</h1>
          <p>Explore the connections between your data, your queries, and your business.</p>
        </div>
        <span className="edition">
          PORTFOLIO EDITION <span>02</span>
        </span>
      </div>
      <section className="hero">
        <div className="hero-copy">
          <span className="hero-label">
            <span /> SQL. SCHEMA. CLARITY.
          </span>
          <h2>
            Complex SQL.
            <br />
            <em>Clear understanding.</em>
          </h2>
          <p>
            Turn database logic into explanations that everyone can follow. Ask a question, explore
            the relationships, and take the documentation with you.
          </p>
          <div className="hero-actions">
            <Link className="button lime" to="/chat">
              Explore the demo <Icon name="arrow" size={18} />
            </Link>
            <Link className="hero-secondary" to="/model2">
              Explain a query <Icon name="arrow" size={16} />
            </Link>
          </div>
          <div className="hero-caption">
            <span>
              <Icon name="check" size={14} /> No API key for the demo
            </span>
            <span>
              <Icon name="check" size={14} /> No database connection
            </span>
          </div>
        </div>
        <div
          className="hero-visual"
          aria-label="Example of SQL becoming a plain-language explanation"
        >
          <div className="visual-orbit orbit-one" />
          <div className="visual-orbit orbit-two" />
          <div className="code-preview">
            <div className="preview-top">
              <div className="window-dots">
                <i />
                <i />
                <i />
              </div>
              <span>monthly_revenue.sql</span>
              <span className="sql-tag">SQL</span>
            </div>
            <pre>
              <span className="line-number">01</span> <b>SELECT</b> MONTH(b.endTime),
              <br />
              <span className="line-number">02</span> <strong>SUM</strong>(b.total) <b>AS</b>{" "}
              revenue
              <br />
              <span className="line-number">03</span> <b>FROM</b> booking <b>AS</b> b<br />
              <span className="line-number">04</span> <b>WHERE</b> b.status = <em>'completed'</em>
              <br />
              <span className="line-number">05</span> <b>GROUP BY</b> MONTH(b.endTime);
            </pre>
          </div>
          <div className="connection-trail">
            <span />
            <Icon name="arrow" size={17} />
            <span>SCHEMA + CONTEXT</span>
          </div>
          <div className="explanation-preview">
            <span className="preview-icon">
              <Icon name="document" />
            </span>
            <div>
              <span className="tiny-label">IN PLAIN LANGUAGE</span>
              <p>“Add up completed booking totals, grouped by month.”</p>
              <span className="preview-footnote">A small query. A clearer picture.</span>
            </div>
          </div>
          <div className="floating-chip">
            <span className="status-dot" /> Understand the why.
          </div>
        </div>
      </section>
      <section className="capabilities-section" aria-labelledby="capabilities-title">
        <div className="section-heading">
          <div>
            <span className="eyebrow">THREE WAYS TO EXPLORE</span>
            <h2 id="capabilities-title">Follow your curiosity.</h2>
          </div>
          <span className="section-aside">One workspace, from question to documentation.</span>
        </div>
        <div className="capability-grid">
          <Link to="/chat" className="capability-card">
            <div className="card-top">
              <span className="feature-icon green">
                <Icon name="chat" size={24} />
              </span>
              <span className="card-number">01</span>
            </div>
            <h3>Ask your database</h3>
            <p>
              Walk through sample business questions with explanations and a visual map of the
              relevant schema.
            </p>
            <span className="card-link">
              Start a conversation <Icon name="arrow" size={17} />
            </span>
          </Link>
          <Link to="/model1" className="capability-card">
            <div className="card-top">
              <span className="feature-icon blue">
                <Icon name="code" size={24} />
              </span>
              <span className="card-number">02</span>
            </div>
            <h3>Go from question to SQL</h3>
            <p>
              Explore how a business question translates into a query, with its schema right beside
              it.
            </p>
            <span className="card-link">
              Open SQL generator <Icon name="arrow" size={17} />
            </span>
          </Link>
          <Link to="/model2" className="capability-card">
            <div className="card-top">
              <span className="feature-icon orange">
                <Icon name="document" size={24} />
              </span>
              <span className="card-number">03</span>
            </div>
            <h3>Read between the lines</h3>
            <p>
              Break down your own SELECT query into readable steps. See its tables and columns
              connected.
            </p>
            <span className="card-link">
              Open SQL explainer <Icon name="arrow" size={17} />
            </span>
          </Link>
        </div>
      </section>
      <section className="under-hood">
        <div className="under-hood-intro">
          <span className="eyebrow">BUILT FOR EXPLAINABILITY</span>
          <h2>Context before conclusions.</h2>
          <p>
            The research combines SQL parsing, schema graphs, and retrieval to ground explanations
            in the system's structure.
          </p>
          <a href={`${REPOSITORY}/blob/main/docs/ARCHITECTURE.md`} target="_blank" rel="noreferrer">
            Explore the architecture <Icon name="external" size={14} />
          </a>
        </div>
        <ol className="workflow-strip">
          <li>
            <span>01</span>
            <Icon name="code" />
            <strong>Parse</strong>
            <small>SQL structure</small>
          </li>
          <li>
            <span>02</span>
            <Icon name="graph" />
            <strong>Connect</strong>
            <small>Schema relationships</small>
          </li>
          <li>
            <span>03</span>
            <Icon name="book" />
            <strong>Explain</strong>
            <small>Readable documentation</small>
          </li>
        </ol>
      </section>
      <div className="demo-note">
        <Icon name="database" size={17} />
        <p>
          <strong>A transparent demo.</strong> Chat and generation use three prepared OurSpace
          examples. The SQL explainer parses your own queries locally. Original model workflows are
          available as an optional research setup.
        </p>
      </div>
    </>
  );
}

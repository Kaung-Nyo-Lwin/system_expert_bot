import { Suspense } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useApp } from "../lib/context";
import { REPOSITORY } from "../lib/api";
import Icon from "./Icon";

const navigation = [
  ["/", "Overview", "overview"],
  ["/chat", "Ask your database", "chat"],
  ["/model1", "SQL generator", "code"],
  ["/model2", "SQL explainer", "document"],
];
export default function AppShell() {
  const { status, mode, error, refresh } = useApp();
  const location = useLocation();
  const title = navigation.find(([path]) => path === location.pathname)?.[1] || "Workspace";
  return (
    <div className="app-layout">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <aside className="sidebar">
        <Link className="brand" to="/" aria-label="SoftwareDocBot overview">
          <span className="brand-mark">
            <Icon name="code" size={23} />
          </span>
          <span>
            Software<span className="brand-light">DocBot</span>
            <small>MAKE THE LOGIC CLEAR</small>
          </span>
        </Link>
        <div className="nav-caption">WORKSPACE</div>
        <nav aria-label="Main navigation">
          {navigation.map(([path, label, icon]) => (
            <NavLink
              end
              to={path}
              key={path}
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            >
              <Icon name={icon} />
              <span>{label}</span>
              {path === "/" && <span className="nav-dot" />}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-note">
          <span className="tiny-label">THE IDEA</span>
          <p>
            Your database has a story.
            <br />
            Make it understandable.
          </p>
          <div className="mini-line" />
        </div>
        <div className="sidebar-bottom">
          <div className="dataset-card">
            <Icon name="database" />
            <div>
              <strong>OurSpace</strong>
              <span>Sample database · MySQL</span>
            </div>
            <span className="status-dot" />
          </div>
          <a
            className="author"
            href="https://github.com/Kaung-Nyo-Lwin"
            target="_blank"
            rel="noreferrer"
          >
            <span className="avatar">KN</span>
            <span>
              <strong>Kaung Nyo Lwin</strong>
              <small>Portfolio project</small>
            </span>
            <Icon name="external" size={14} />
          </a>
        </div>
      </aside>
      <div className="main-column">
        <header className="topbar">
          <div className="breadcrumb">
            Workspace <span>/</span> <strong>{title}</strong>
          </div>
          <div className="topbar-actions">
            <span className={`mode-badge ${status === "offline" ? "offline" : ""}`}>
              <span className="status-dot" />
              {status === "loading"
                ? "Connecting"
                : status === "offline"
                  ? "API offline"
                  : mode === "demo"
                    ? "Interactive demo"
                    : "Research mode"}
            </span>
            <a className="source-link" href={REPOSITORY} target="_blank" rel="noreferrer">
              View source <Icon name="external" size={15} />
            </a>
          </div>
        </header>
        <main id="main-content" className="page-content">
          {status === "offline" && (
            <div className="error-banner" role="alert">
              <span>{error}</span>
              <button className="text-button" onClick={refresh}>
                Retry connection <Icon name="refresh" size={14} />
              </button>
            </div>
          )}
          <Suspense
            fallback={
              <div className="page-loading" role="status">
                Opening workspace…
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </main>
        <footer className="page-footer">
          <span>
            SoftwareDocBot <span className="footer-dot">/</span> From schema to understanding.
          </span>
          <a href={`${REPOSITORY}#credits`} target="_blank" rel="noreferrer">
            Project background & credits <Icon name="external" size={12} />
          </a>
        </footer>
      </div>
    </div>
  );
}

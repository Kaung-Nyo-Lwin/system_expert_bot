import React, { lazy } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import AppShell from "./components/AppShell";
import { AppProvider } from "./lib/context";
import LandingPage from "./pages/LandingPage";
import "./index.css";

const ChatPage = lazy(() => import("./pages/ChatPage"));
const SqlWorkspace = lazy(() => import("./pages/SqlWorkspace"));

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<LandingPage />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="model1" element={<SqlWorkspace key="generate" mode="generate" />} />
            <Route path="model2" element={<SqlWorkspace key="explain" mode="explain" />} />
            <Route
              path="*"
              element={
                <div className="empty-state">
                  <h1>Page not found</h1>
                  <Link className="button primary" to="/">
                    Back to overview
                  </Link>
                </div>
              }
            />
          </Route>
        </Routes>
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>,
);

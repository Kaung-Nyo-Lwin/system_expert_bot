import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { request } from "./api";

const AppContext = createContext(null);
export function AppProvider({ children }) {
  const [status, setStatus] = useState("loading");
  const [mode, setMode] = useState(null);
  const [examples, setExamples] = useState([]);
  const [error, setError] = useState("");
  const refresh = useCallback(async () => {
    setStatus("loading");
    setError("");
    try {
      const [health, samples] = await Promise.all([
        request("/api/health"),
        request("/api/examples"),
      ]);
      setMode(health.mode);
      setExamples(samples.examples);
      setStatus("ready");
    } catch (err) {
      setError(err.message);
      setStatus("offline");
    }
  }, []);
  useEffect(() => {
    refresh();
  }, [refresh]);
  return (
    <AppContext.Provider value={{ status, mode, examples, error, refresh }}>
      {children}
    </AppContext.Provider>
  );
}
export const useApp = () => useContext(AppContext);

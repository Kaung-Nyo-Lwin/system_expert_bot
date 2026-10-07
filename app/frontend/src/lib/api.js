const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
export const apiUrl = (path) => `${API_BASE}/${path.replace(/^\//, "")}`;

export async function request(path, body) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 130000);
  try {
    const response = await fetch(apiUrl(path), {
      method: body === undefined ? "GET" : "POST",
      headers: body === undefined ? {} : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) throw new Error(data?.error || "The server could not complete this request.");
    if (!data)
      throw new Error("The API returned an unexpected response. Check the server address.");
    return data;
  } catch (error) {
    if (error.name === "AbortError") throw new Error("The request timed out. Please try again.");
    if (error instanceof TypeError)
      throw new Error("Cannot reach the API. Start the backend and try again.");
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

export const REPOSITORY = "https://github.com/Kaung-Nyo-Lwin/system_expert_bot";

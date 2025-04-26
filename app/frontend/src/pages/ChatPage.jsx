import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import VisGraph from "../components/VisGraph"; // Import VisGraph

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input, nodes: [], edges: [] };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    try {
      const res = await fetch("http://localhost:8000/api/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_input: input }),
      });

      if (!res.ok) throw new Error("Failed to fetch");

      const data = await res.json();

      const botMsg = {
        sender: "bot",
        text: data.response,
        nodes: data.nodes || [],
        edges: data.edges || [],
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error("Message send failed:", error);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-white text-gray-900 font-sans">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-6 shadow">
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate("/")}>
          <img src={logo} alt="Logo" className="h-20 sm:h-24" />
          <h1 className="text-3xl font-bold tracking-tight">SoftwareDocBot</h1>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-grow px-4 sm:px-6 py-6 overflow-y-auto overflow-x">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((msg, i) => (
            <React.Fragment key={i}>
              <div className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`overflow-y-auto max-w-[80%] p-4 rounded-2xl text-base shadow ${
                    msg.sender === "user"
                      ? "bg-[#00857C] text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <ReactMarkdown >{msg.text}</ReactMarkdown>
                  
                </div>
              </div>
              {msg.nodes?.length > 0 && msg.edges?.length > 0 && (
                <VisGraph nodes={msg.nodes} edges={msg.edges} />
              )}
            </React.Fragment>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input */}
      <footer className="fixed bottom-8 left-0 right-0 flex justify-center px-4">
        <div className="flex items-center w-full max-w-4xl bg-white border border-gray-300 shadow-xl rounded-full px-6 py-4">
          <input
            className="flex-grow bg-transparent outline-none px-6 py-3 text-gray-900 text-lg placeholder-gray-400"
            placeholder="Ask anything about your software system..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={sendMessage}
            className="ml-4 px-8 py-3 text-lg bg-[#00857C] hover:bg-[#006f67] text-white rounded-full transition-all"
          >
            Send
          </button>
        </div>
      </footer>
    </div>
  );
}

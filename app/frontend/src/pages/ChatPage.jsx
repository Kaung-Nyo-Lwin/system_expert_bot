// import React, { useState, useEffect, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import logo from "../assets/logo.png";
// import VisGraph from "../components/VisGraph";
// import ReactMarkdown from "react-markdown";

// export default function ChatPage() {
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [loadingDots, setLoadingDots] = useState(""); // for animation
  
//   useEffect(() => {
//     let interval;
//     if (loading) {
//       interval = setInterval(() => {
//         setLoadingDots(prev => (prev.length >= 3 ? "" : prev + "."));
//       }, 500);
//     } else {
//       setLoadingDots("");
//     }
//     return () => clearInterval(interval);
//   }, [loading]);
//   // <-- New loading state
//   const messagesEndRef = useRef(null);
//   const navigate = useNavigate();

//   const sendMessage = async () => {
//     if (!input.trim()) return;

//     const userMsg = { sender: "user", text: input, nodes: [], edges: [], docPath: null };
//     setMessages((prev) => [...prev, userMsg]);
//     setInput("");
//     setLoading(true);  // <-- Start loading

//     try {
//       const res = await fetch("http://localhost:8000/api/message", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ user_input: input }),
//       });

//       if (!res.ok) throw new Error("Failed to fetch");

//       const data = await res.json();

//       const botMsg = {
//         sender: "bot",
//         text: data.response,
//         nodes: data.nodes || [],
//         edges: data.edges || [],
//         docPath: data.doc_path || null,
//       };

//       setMessages((prev) => [...prev, botMsg]);
//     } catch (error) {
//       console.error("Message send failed:", error);
//     } finally {
//       setLoading(false);  // <-- Stop loading
//     }
//   };

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages, loading]);  // <- Also scroll when loading changes

//   return (
//     <div className="flex flex-col h-screen bg-gradient-to-b from-gray-50 via-white to-gray-100 text-gray-900 font-sans">
//       {/* Header */}
//       <header className="flex items-center justify-between px-6 py-4 shadow-sm bg-white">
//         <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate("/")}>
//           <img src={logo} alt="Logo" className="h-12 sm:h-16" />
//           <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">SoftwareDocBot</h1>
//         </div>
//       </header>

//       {/* Chat Area */}
//       <main className="flex-1 overflow-y-auto px-4 sm:px-6 pt-6 pb-36">
//         <div className="max-w-4xl mx-auto space-y-8">
//           {messages.map((msg, i) => (
//             <React.Fragment key={i}>
//               <div className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
//                 {msg.sender === "user" ? (
//                   <div className="max-w-[80%]">
//                     <div className="p-4 sm:p-5 rounded-2xl text-base shadow-md bg-[#00857C] text-white">
//                       <ReactMarkdown>{msg.text}</ReactMarkdown>
//                     </div>
//                   </div>
//                 ) : (
//                   <div className="w-full space-y-4">
//                     <div className="p-6 rounded-2xl text-base shadow-md bg-gray-100 text-gray-900 overflow-x-auto">
//                       <ReactMarkdown>{msg.text}</ReactMarkdown>

//                       {/* If there is a docPath, show download button */}
//                       {msg.docPath && (
//                         <div className="mt-4">
//                           <a
//                             href={`http://localhost:8000/${msg.docPath}`}
//                             download
//                             target="_blank"
//                             rel="noopener noreferrer"
//                             className="inline-block bg-[#00857C] hover:bg-[#006f67] text-white text-sm font-semibold px-5 py-2 rounded-full transition-all"
//                           >
//                             📄 Download PDF
//                           </a>
//                         </div>
//                       )}
//                     </div>

//                     {msg.nodes?.length > 0 && msg.edges?.length > 0 && (
//                       <div className="bg-white p-6 rounded-2xl shadow-md">
//                         <VisGraph nodes={msg.nodes} edges={msg.edges} />
//                       </div>
//                     )}
//                   </div>
//                 )}
//               </div>
//             </React.Fragment>
//           ))}

//           {/* Show loading placeholder */}
//           {loading && (
//           <div className="flex justify-start">
//           <div className="p-4 sm:p-5 rounded-2xl text-base shadow-md bg-gray-100 text-gray-400 animate-pulse">
//             Generating response{loadingDots}
//           </div>
//           </div>
// )}
//           <div ref={messagesEndRef} />
//         </div>
//       </main>

//       {/* Input Floating Bar */}
//       <footer className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-full max-w-4xl px-4">
//         <div className="flex items-center bg-white border border-gray-300 shadow-lg rounded-full px-6 py-4">
//           <input
//             className="flex-grow bg-transparent outline-none px-4 py-2 text-gray-900 text-lg placeholder-gray-400"
//             placeholder="Ask anything about your software system..."
//             value={input}
//             onChange={(e) => setInput(e.target.value)}
//             onKeyDown={(e) => e.key === "Enter" && sendMessage()}
//             disabled={loading} // disable input while waiting
//           />
//           <button
//             onClick={sendMessage}
//             disabled={loading} // disable send while loading
//             className={`ml-4 px-6 py-2 text-lg ${
//               loading ? "bg-gray-400" : "bg-[#00857C] hover:bg-[#006f67]"
//             } text-white rounded-full transition-all`}
//           >
//             {loading ? "Sending" + loadingDots : "Send"}
//           </button>
//         </div>
//       </footer>
//     </div>
//   );
// }


import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import VisGraph from "../components/VisGraph";
import ReactMarkdown from "react-markdown";

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingDots, setLoadingDots] = useState("");
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // Animate "Sending..." dots
  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(() => {
        setLoadingDots(prev => (prev.length >= 3 ? "" : prev + "."));
      }, 500);
    } else {
      setLoadingDots("");
    }
    return () => clearInterval(interval);
  }, [loading]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input, nodes: [], edges: [], docPath: null };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

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
        docPath: data.doc_path || null,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error("Message send failed:", error);
    } finally {
      setLoading(false);
    }
  };

  // Reset chat
  const resetChat = () => {
    setMessages([]);
    setInput("");
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-gray-50 via-white to-gray-100 text-gray-900 font-sans">

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 shadow-sm bg-white">
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate("/")}>
          <img src={logo} alt="Logo" className="h-12 sm:h-16" />
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">SoftwareDocBot</h1>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-6 pt-6 pb-36">
        <div className="max-w-4xl mx-auto space-y-8">
          {messages.map((msg, i) => (
            <React.Fragment key={i}>
              <div className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                {msg.sender === "user" ? (
                  <div className="max-w-[80%]">
                    <div className="p-4 sm:p-5 rounded-2xl text-base shadow-md bg-[#00857C] text-white">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  </div>
                ) : (
                  <div className="w-full space-y-4">
                    <div className="p-6 rounded-2xl text-base shadow-md bg-gray-100 text-gray-900 overflow-x-auto">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>

                      {/* Show download PDF if available */}
                      {msg.docPath && (
                        <div className="mt-4">
                          <a
                            href={`http://localhost:8000/${msg.docPath}`}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block bg-[#00857C] hover:bg-[#006f67] text-white text-sm font-semibold px-5 py-2 rounded-full transition-all"
                          >
                            📄 Download PDF
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Show Graph if available */}
                    {msg.nodes?.length > 0 && msg.edges?.length > 0 && (
                      <div className="bg-white p-6 rounded-2xl shadow-md">
                        <VisGraph nodes={msg.nodes} edges={msg.edges} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </React.Fragment>
          ))}

          {/* Show Loading Placeholder */}
          {loading && (
            <div className="flex justify-start">
              <div className="p-4 sm:p-5 rounded-2xl text-base shadow-md bg-gray-100 text-gray-400 animate-pulse">
                Generating response{loadingDots}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Floating Bar */}
      <footer className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-full max-w-4xl px-4">

<div className="relative flex items-center">

  {/* Input and Send inside a beautiful bubble */}
  <div className="flex flex-grow items-center bg-white border border-gray-300 shadow-lg rounded-full px-6 py-4">
    <input
      className="flex-grow bg-transparent outline-none px-4 py-2 text-gray-900 text-lg placeholder-gray-400"
      placeholder="Ask anything about your software system..."
      value={input}
      onChange={(e) => setInput(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && sendMessage()}
      disabled={loading}
    />
    <button
      onClick={sendMessage}
      disabled={loading}
      className={`ml-4 px-6 py-2 text-lg ${
        loading ? "bg-gray-400" : "bg-[#00857C] hover:bg-[#006f67]"
      } text-white rounded-full transition-all whitespace-nowrap`}
    >
      {loading ? "Sending" + loadingDots : "Send"}
    </button>
  </div>

  {/* Reset Button FLOATING outside */}
  <button
    onClick={resetChat}
    disabled={loading}
    className="absolute right-[-120px] top-1/2 transform -translate-y-1/2 px-5 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded-full shadow transition-all whitespace-nowrap"
  >
    Reset Chat
  </button>

</div>

</footer>

    </div>
  );
}

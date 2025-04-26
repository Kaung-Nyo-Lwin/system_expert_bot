


// import React, { useState, useEffect, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import logo from "../assets/logo.png";

// export default function ChatPage() {
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState("");
//   const [docLink, setDocLink] = useState(null);
//   const messagesEndRef = useRef(null);
//   const navigate = useNavigate();

//   const sendMessage = async () => {
//     if (!input.trim()) return;
//     const userMsg = { sender: "user", text: input };
//     setMessages((prev) => [...prev, userMsg]);
//     setInput("");

//     const res = await fetch("http://localhost:8000/api/message", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ user_input: input }),
//     });

//     const data = await res.json();
//     const botMsg = { sender: "bot", text: data.response };
//     setMessages((prev) => [...prev, botMsg]);
//     setDocLink(data.doc_path ? `http://localhost:8000/${data.doc_path}` : null);
//   };

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   return (
//     <div className="flex flex-col h-screen bg-white text-gray-900 font-sans">
//       {/* Header */}
//       <header className="flex items-center justify-between px-6 py-6 shadow">
//         <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate("/")}> 
//           <img src={logo} alt="Logo" className="h-20 sm:h-24" />
//           <h1 className="text-3xl font-bold tracking-tight">SoftwareDocBot</h1>
//         </div>
//       </header>

//       {/* Chat Area */}
//       <main className="flex-grow px-4 sm:px-6 py-6 overflow-y-auto">
//         <div className="max-w-4xl mx-auto space-y-6">
//           {messages.map((msg, i) => (
//             <div
//               key={i}
//               className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
//             >
//               <div
//                 className={`max-w-[80%] p-4 rounded-2xl text-base shadow ${
//                   msg.sender === "user"
//                     ? "bg-[#00857C] text-white"
//                     : "bg-gray-100 text-gray-900"
//                 }`}
//               >
//                 {msg.text}
//               </div>
//             </div>
//           ))}

//           {docLink && (
//             <div className="text-base text-blue-600 text-center mt-3">
//               <a href={docLink} target="_blank" rel="noreferrer">
//                 📄 Download DOCX
//               </a>
//             </div>
//           )}

//           <div ref={messagesEndRef} />
//         </div>
//       </main>

//       {/* Larger Floating Input Box */}
//       <footer className="fixed bottom-8 left-0 right-0 flex justify-center px-4">
//         <div className="flex items-center w-full max-w-4xl bg-white border border-gray-300 shadow-xl rounded-full px-6 py-4">
//           <input
//             className="flex-grow bg-transparent outline-none px-6 py-3 text-gray-900 text-lg placeholder-gray-400"
//             placeholder="Ask anything about your software system..."
//             value={input}
//             onChange={(e) => setInput(e.target.value)}
//             onKeyDown={(e) => e.key === "Enter" && sendMessage()}
//           />
//           <button
//             onClick={sendMessage}
//             className="ml-4 px-8 py-3 text-lg bg-[#00857C] hover:bg-[#006f67] text-white rounded-full transition-all"
//           >
//             Send
//           </button>
//         </div>
//       </footer>
//     </div>
//   );
// }






// import React, { useState, useEffect, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import logo from "../assets/logo.png";
// import VisGraph from "../components/VisGraph.jsx"; // <- make sure this path is correct

// export default function ChatPage() {
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState("");
//   const [docLink, setDocLink] = useState(null);
//   const messagesEndRef = useRef(null);
//   const navigate = useNavigate();

//   const sendMessage = async () => {
//     if (!input.trim()) return;
//     const userMsg = { sender: "user", type: "text", content: input };
//     setMessages((prev) => [...prev, userMsg]);
//     setInput("");

//     const res = await fetch("http://localhost:8000/api/message", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ user_input: input }),
//     });

//     const data = await res.json();

//     const botMsg = {
//       sender: "bot",
//       type: data.visualize ? "graph" : "text",
//       content: data.response,
//     };

//     setMessages((prev) => [...prev, botMsg]);

//     if (data.doc_path) {
//       setDocLink(`http://localhost:8000/${data.doc_path}`);
//     }
//   };

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   return (
//     <div className="flex flex-col h-screen bg-white text-gray-900 font-sans">
//       {/* Header */}
//       <header className="flex items-center justify-between px-6 py-6 shadow">
//         <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate("/")}>
//           <img src={logo} alt="Logo" className="h-20 sm:h-24" />
//           <h1 className="text-3xl font-bold tracking-tight">SoftwareDocBot</h1>
//         </div>
//       </header>

//       {/* Chat Area */}
//       <main className="flex-grow px-4 sm:px-6 py-6 overflow-y-auto">
//         <div className="max-w-4xl mx-auto space-y-6">
//           {messages.map((msg, i) => (
//             <div
//               key={i}
//               className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
//             >
//               <div
//                 className={`max-w-[80%] rounded-2xl text-base shadow ${
//                   msg.sender === "user"
//                     ? "bg-[#00857C] text-white p-4"
//                     : "bg-gray-100 text-gray-900 p-4"
//                 }`}
//               >
//                 {msg.type === "graph" ? <VisGraph /> : <span>{msg.content}</span>}
//               </div>
//             </div>
//           ))}

//           {docLink && (
//             <div className="text-base text-blue-600 text-center mt-3">
//               <a href={docLink} target="_blank" rel="noreferrer">
//                 📄 Download DOCX
//               </a>
//             </div>
//           )}

//           <div ref={messagesEndRef} />
//         </div>
//       </main>

//       {/* Floating Input */}
//       <footer className="fixed bottom-8 left-0 right-0 flex justify-center px-4">
//         <div className="flex items-center w-full max-w-4xl bg-white border border-gray-300 shadow-xl rounded-full px-6 py-4">
//           <input
//             className="flex-grow bg-transparent outline-none px-6 py-3 text-gray-900 text-lg placeholder-gray-400"
//             placeholder="Ask anything about your software system..."
//             value={input}
//             onChange={(e) => setInput(e.target.value)}
//             onKeyDown={(e) => e.key === "Enter" && sendMessage()}
//           />
//           <button
//             onClick={sendMessage}
//             className="ml-4 px-8 py-3 text-lg bg-[#00857C] hover:bg-[#006f67] text-white rounded-full transition-all"
//           >
//             Send
//           </button>
//         </div>
//       </footer>
//     </div>
//   );
// }




// import React, { useState, useEffect, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import logo from "../assets/logo.png";

// export default function ChatPage() {
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState("");
//   const [docLink, setDocLink] = useState(null);
//   const [showHtml, setShowHtml] = useState(false);
//   const messagesEndRef = useRef(null);
//   const navigate = useNavigate();

//   // Handle sending messages
//   const sendMessage = async () => {
//     if (!input.trim()) return;

//     // Add user message to chat
//     const userMsg = { sender: "user", text: input };
//     setMessages((prev) => [...prev, userMsg]);
//     setInput("");

//     try {
//       const res = await fetch("http://localhost:8000/api/message", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ user_input: input }),
//       });

//       const data = await res.json();
//       const botMsg = {
//         sender: "bot",
//         text: data.response,
//         type: "html",  // use "html" for graph response, or "text" if conditionally needed
//       };
//       setMessages((prev) => [...prev, botMsg]);
//       setDocLink(data.doc_path ? `http://localhost:8000/${data.doc_path}` : null);

//       // Show the HTML graph after bot responds
//       setShowHtml(true);
//     } catch (error) {
//       console.error("Message send failed:", error);
//     }
//   };

//   // Scroll to bottom on message update
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   return (
//     <div className="flex flex-col h-screen bg-white text-gray-900 font-sans">
//       {/* Header */}
//       <header className="flex items-center justify-between px-6 py-6 shadow">
//         <div
//           className="flex items-center gap-4 cursor-pointer"
//           onClick={() => navigate("/")}
//         >
//           <img src={logo} alt="Logo" className="h-20 sm:h-24" />
//           <h1 className="text-3xl font-bold tracking-tight">SoftwareDocBot</h1>
//         </div>
//       </header>

//       {/* Chat Area */}
//       <main className="flex-grow px-4 sm:px-6 py-6 overflow-y-auto">
//       <div className="max-w-4xl mx-auto space-y-6">
//       {/* Chat Messages */}
//         {messages.map((msg, i) => (
//       <div
//         key={i}
//         className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
//       >
//         <div
//           className={`max-w-[80%] p-4 rounded-2xl text-base shadow ${
//             msg.sender === "user"
//               ? "bg-[#00857C] text-white"
//               : "bg-gray-100 text-gray-900"
//           }`}
//         >
//           {msg.sender === "bot" ? (
//             <div className="w-full mt-4">
//             <iframe
//               src="/visualizations/query_query_7461764137375118208.html"
//               title="Query Graph"
//               className="w-full mt-2 rounded-md border border-gray-200"
//               style={{ height: "700px" }}
//             />
//             </div>
//           ) : (
//             msg.text
//           )}
//         </div>
//       </div>
//     ))}

//     {/* Optional DOCX Download */}
//     {docLink && (
//       <div className="text-base text-blue-600 text-center mt-3">
//         <a href={docLink} target="_blank" rel="noreferrer">
//           📄 Download DOCX
//         </a>
//       </div>
//     )}

//     <div ref={messagesEndRef} />
//   </div>
// </main>

//       {/* Chat Input Box */}
//       <footer className="fixed bottom-8 left-0 right-0 flex justify-center px-4">
//         <div className="flex items-center w-full max-w-4xl bg-white border border-gray-300 shadow-xl rounded-full px-6 py-4">
//           <input
//             className="flex-grow bg-transparent outline-none px-6 py-3 text-gray-900 text-lg placeholder-gray-400"
//             placeholder="Ask anything about your software system..."
//             value={input}
//             onChange={(e) => setInput(e.target.value)}
//             onKeyDown={(e) => e.key === "Enter" && sendMessage()}
//           />
//           <button
//             onClick={sendMessage}
//             className="ml-4 px-8 py-3 text-lg bg-[#00857C] hover:bg-[#006f67] text-white rounded-full transition-all"
//           >
//             Send
//           </button>
//         </div>
//       </footer>
//     </div>
//   );
// }


import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

const visualizationHtml = `
<html>
    <head>
        <meta charset="utf-8">
        
            <script src="lib/bindings/utils.js"></script>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/vis-network/9.1.2/dist/dist/vis-network.min.css" integrity="sha512-WgxfT5LWjfszlPHXRmBWHkV2eceiWTOBvrKCNbdgDYTHrT2AeLCGbF4sZlZw3UMN3WtL0tGUoIAKsu8mllg/XA==" crossorigin="anonymous" referrerpolicy="no-referrer" />
            <script src="https://cdnjs.cloudflare.com/ajax/libs/vis-network/9.1.2/dist/vis-network.min.js" integrity="sha512-LnvoEWDFrqGHlHmDD2101OrLcbsfkrzoSpvtSQtxK3RMnRV0eOkhhBN2dXHKRrUU8p2DGRTk35n4O8nWSVe1mQ==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
            
        
<center>
<h1></h1>
</center>

        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta3/dist/css/bootstrap.min.css"
          rel="stylesheet"
          integrity="sha384-eOJMYsd53ii+scO/bJGFsiCZc+5NDVN2yr8+0RDqr0Ql0h+rP48ckxlpbzKgwra6"
          crossorigin="anonymous"
        />
        <script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta3/dist/js/bootstrap.bundle.min.js"
          integrity="sha384-JEW9xMcG8R+pH31jmWH6WWP0WintQrMb4s7ZOdauHnUtxwoG2vI5DkLtS3qm9Ekf"
          crossorigin="anonymous"
        ></script>


        <center>
          <h1></h1>
        </center>
        <style type="text/css">
             #mynetwork {
                 width: 100%;
                 height: 800px;
                 background-color: #ffffff;
                 border: 1px solid lightgray;
                 position: relative;
                 float: left;
             }
        </style>
    </head>


    <body>
        <div class="card" style="width: 100%">
            <div id="mynetwork" class="card-body"></div>
        </div>

        <script type="text/javascript">
              // initialize global variables.
              var edges;
              var nodes;
              var allNodes;
              var allEdges;
              var nodeColors;
              var originalNodes;
              var network;
              var container;
              var options, data;
              var filter = {
                  item : '',
                  property : '',
                  value : []
              };

              // This method is responsible for drawing the graph, returns the drawn network
              function drawGraph() {
                  var container = document.getElementById('mynetwork');

                  // parsing and collecting nodes and edges from the python
                  nodes = new vis.DataSet([{"color": "#FFAAAA", "id": "query_7461764137375118208", "label": "Query", "shape": "box"}, {"color": "#AAAAFF", "id": "table_location", "label": "location", "shape": "dot"}, {"color": "#AAFFAA", "id": "column_museum_object.title", "label": "title\n(museum_object)", "shape": "dot"}, {"color": "#AAFFAA", "id": "column_museum_object.id", "label": "id\n(museum_object)", "shape": "dot"}, {"color": "#AAFFAA", "id": "column_attribute.art_style", "label": "art_style\n(attribute)", "shape": "dot"}, {"color": "#AAFFAA", "id": "column_location.country", "label": "country\n(location)", "shape": "dot"}, {"color": "#AAFFAA", "id": "column_attribute.object_id", "label": "object_id\n(attribute)", "shape": "dot"}, {"color": "#AAFFAA", "id": "column_location.id", "label": "id\n(location)", "shape": "dot"}, {"color": "#AAFFAA", "id": "column_attribute.material", "label": "material\n(attribute)", "shape": "dot"}, {"color": "#AAAAFF", "id": "table_attribute", "label": "attribute", "shape": "dot"}, {"color": "#AAAAFF", "id": "table_museum_object", "label": "museum_object", "shape": "dot"}]);
                  edges = new vis.DataSet([{"arrows": "to", "color": "green", "from": "table_attribute", "label": "REFERENCES", "to": "table_museum_object"}, {"arrows": "to", "color": "red", "dashes": false, "from": "column_museum_object.id", "label": "JOINED_WITH", "to": "column_attribute.object_id"}, {"arrows": "to", "color": "blue", "from": "query_7461764137375118208", "label": "ACCESSES", "to": "table_location"}, {"arrows": "to", "color": "blue", "from": "query_7461764137375118208", "label": "ACCESSES", "to": "table_attribute"}, {"arrows": "to", "color": "blue", "from": "query_7461764137375118208", "label": "ACCESSES", "to": "table_museum_object"}, {"arrows": "to", "color": "green", "from": "query_7461764137375118208", "label": "REFERENCES", "to": "column_location.country"}, {"arrows": "to", "color": "green", "from": "query_7461764137375118208", "label": "REFERENCES", "to": "column_attribute.art_style"}, {"arrows": "to", "color": "green", "from": "query_7461764137375118208", "label": "REFERENCES", "to": "column_attribute.material"}, {"arrows": "to", "color": "green", "from": "query_7461764137375118208", "label": "REFERENCES", "to": "column_location.id"}, {"arrows": "to", "color": "green", "from": "query_7461764137375118208", "label": "REFERENCES", "to": "column_attribute.object_id"}, {"arrows": "to", "color": "green", "from": "query_7461764137375118208", "label": "REFERENCES", "to": "column_museum_object.id"}, {"arrows": "to", "color": "green", "from": "query_7461764137375118208", "label": "REFERENCES", "to": "column_museum_object.title"}]);

                  nodeColors = {};
                  allNodes = nodes.get({ returnType: "Object" });
                  for (nodeId in allNodes) {
                    nodeColors[nodeId] = allNodes[nodeId].color;
                  }
                  allEdges = edges.get({ returnType: "Object" });
                  data = {nodes: nodes, edges: edges};

                  var options = {"physics": {"hierarchicalRepulsion": {"centralGravity": 0, "springLength": 200, "springConstant": 0.01, "nodeDistance": 200, "damping": 0.09}, "minVelocity": 0.75, "solver": "hierarchicalRepulsion"}};

                  network = new vis.Network(container, data, options);
                  return network;
              }
              drawGraph();
        </script>
    </body>
</html>
`;

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const sendMessage = () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Simulate bot response with visualization
    setTimeout(() => {
      const botMsg = { 
        sender: "bot", 
        text: "Here's the visualization you requested:",
        visualization: true 
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 500);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Render HTML visualization safely
  const renderVisualization = () => {
    return (
      <div className="max-w-4xl mx-auto mt-4 border rounded-lg overflow-hidden">
        <div dangerouslySetInnerHTML={{ __html: visualizationHtml }} />
      </div>
    );
  };

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
      <main className="flex-grow px-4 sm:px-6 py-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((msg, i) => (
            <React.Fragment key={i}>
              <div className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] p-4 rounded-2xl text-base shadow ${
                    msg.sender === "user"
                      ? "bg-[#00857C] text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
              {msg.visualization && renderVisualization()}
            </React.Fragment>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Box */}
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



import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import ChatPage from "./pages/ChatPage";
import ModelOnePage from "./pages/ModelOnePage"; 
import ModelTwoPage from "./pages/ModelTwoPage";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <Router>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/chat" element={<ChatPage />} />
      <Route path="/model1" element={<ModelOnePage />} /> {/* ADD THIS */}
      <Route path="/model2" element={<ModelTwoPage />} /> {/* ADD THIS */}

    </Routes>
  </Router>
);


// import React from "react";
// import ReactDOM from "react-dom/client";
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import LandingPage from "./pages/LandingPage";
// import ChatPage from "./pages/ChatPage";
// import ModelOnePage from "./pages/ModelOnePage"; // ADD THIS
// import ModelTwoPage from "./pages/ModelTwoPage"; // ADD THIS
// import "./index.css";

// ReactDOM.createRoot(document.getElementById("root")).render(
//   <Router>
//     <Routes>
//       <Route path="/" element={<LandingPage />} />
//       <Route path="/chat" element={<ChatPage />} />
//       <Route path="/model1" element={<ModelOnePage />} /> {/* ADD THIS */}
//       <Route path="/model2" element={<ModelTwoPage />} /> {/* ADD THIS */}
//     </Routes>
//   </Router>
// );

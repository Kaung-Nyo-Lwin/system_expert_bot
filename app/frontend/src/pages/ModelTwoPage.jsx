import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ModelTwoPage() {
  const navigate = useNavigate();

  const [userInput, setUserInput] = useState("");
  const [schemaInput, setSchemaInput] = useState("");
  const [queryInput, setQueryInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setUserInput(e.target.value);
  };

  const handleSchemaInputChange = (e) => {
    setSchemaInput(e.target.value);
  };

  const handleQueryInputChange = (e) => {
    setQueryInput(e.target.value);
  };

  const handleGenerate = async () => {
    if (!userInput && !schemaInput && !queryInput) {
      alert("Please fill Schema, Question, and SQL Query.");
      return;
    }

    const payload = {
      schema: schemaInput,
      question: userInput,
      query: queryInput,
    };

    try {
      setLoading(true);
      setOutput("");
      const response = await fetch("http://localhost:8000/api/generate-explanation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      setOutput(data.output || "No output received.");
    } catch (error) {
      console.error("Error generating explanation:", error);
      setOutput("Failed to generate explanation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 to-purple-100 p-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">SQL Explainer</h1>

      {/* Form Section */}
      <div className="bg-white shadow-xl rounded-3xl p-10 w-full max-w-4xl text-center space-y-8">
        
        {/* User Question Input */}
        <div className="text-left space-y-2">
          <label className="block text-lg font-semibold text-gray-700">
            User Question
          </label>
          <input
            type="text"
            placeholder="Enter your question here..."
            value={userInput}
            onChange={handleInputChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-400 text-gray-700"
          />
        </div>

        {/* SQL Schema Input */}
        <div className="text-left space-y-2">
          <label className="block text-lg font-semibold text-gray-700">
            SQL Schema Input
          </label>
          <textarea
            placeholder="Enter your schema code here..."
            value={schemaInput}
            onChange={handleSchemaInputChange}
            rows="5"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-700"
          />
        </div>

        {/* SQL Query Input */}
        <div className="text-left space-y-2">
          <label className="block text-lg font-semibold text-gray-700">
            SQL Query Input
          </label>
          <textarea
            placeholder="Enter your SQL query here..."
            value={queryInput}
            onChange={handleQueryInputChange}
            rows="5"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-700"
          />
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mt-6">
          <button
            onClick={handleGenerate}
            className="px-8 py-3 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-lg font-medium rounded-full shadow-md transition-transform transform hover:scale-105"
          >
            📖 Generate Explanation
          </button>

          <button
            onClick={() => navigate("/")}
            className="px-8 py-3 bg-gray-400 hover:bg-gray-500 text-white text-lg font-medium rounded-full shadow-md transition-transform transform hover:scale-105"
          >
            ← Back to Home
          </button>
        </div>

        {/* Output Display Section */}
        {loading ? (
          <div className="mt-8 text-pink-600 text-lg font-semibold">Generating explanation...</div>
        ) : output && (
          <div className="mt-8 p-6 bg-gray-100 rounded-2xl text-left shadow-inner">
            <h2 className="text-2xl font-bold text-gray-700 mb-4">Generated Explanation:</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{output}</p>
          </div>
        )}
      </div>
    </div>
  );
}

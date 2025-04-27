import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ModelOnePage() {
  const navigate = useNavigate();

  const [userInput, setUserInput] = useState("");
  const [schemaInput, setSchemaInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setUserInput(e.target.value);
  };

  const handleSchemaInputChange = (e) => {
    setSchemaInput(e.target.value);
  };

  const handleGenerate = async () => {
    if (!userInput && !schemaInput) {
      alert("Please fill at least the Question and Schema fields.");
      return;
    }

    const payload = {
      question: userInput,
      schema: schemaInput,
    };

    try {
      setLoading(true);
      setOutput("");
      const response = await fetch("http://localhost:8000/api/generate-sql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log(data);

      setOutput(data.output || "No output received.");
    } catch (error) {
      console.error("Error generating SQL:", error);
      setOutput("Failed to generate SQL. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-sky-50 to-indigo-100 p-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-6"> SQL Query Generator </h1>

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
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700"
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
            rows="6"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-700"
          />
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mt-6">
          <button
            onClick={handleGenerate}
            className="px-8 py-3 bg-[#00857C] hover:bg-[#006f67] text-white text-lg font-medium rounded-full shadow-md transition-transform transform hover:scale-105"
          >
            🚀 Generate SQL
          </button>

          <button
            onClick={() => navigate("/")}
            className="px-8 py-3 bg-gray-400 hover:bg-gray-500 text-white text-lg font-medium rounded-full shadow-md transition-transform transform hover:scale-105"
          >
            ← Back to Home
          </button>
        </div>

        {/* Output Section */}
        {loading ? (
          <div className="mt-8 text-blue-600 text-lg font-semibold">Generating SQL...</div>
        ) : output && (
          <div className="mt-8 p-6 bg-gray-100 rounded-2xl text-left shadow-inner">
            <h2 className="text-2xl font-bold text-gray-700 mb-4">Generated SQL:</h2>
            <pre className="text-gray-700 whitespace-pre-wrap break-words">{output}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

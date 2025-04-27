import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo1.png";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-sky-50 to-blue-100 flex flex-col justify-center items-center px-6 py-10">
      {/* Logo & Title */}
      <div className="flex flex-col items-center text-center">
        <img src={logo} alt="SoftwareDocBot Logo" className="w-32 mb-4 drop-shadow-xl" />
        <h1 className="text-5xl font-black tracking-tight text-gray-800">SoftwareDocBot</h1>
        <p className="mt-2 text-lg text-gray-500 font-light">Your AI-Powered Software System Interpreter</p>
      </div>

      {/* Card Container */}
      <div className="mt-12 max-w-4xl w-full bg-white shadow-xl rounded-3xl p-10 transition-all hover:scale-[1.015] border border-gray-100">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Why SoftwareDocBot?
        </h2>
        <p className="text-gray-600 leading-relaxed mb-6">
          Say goodbye to unreadable SQL and cryptic schemas. SoftwareDocBot reads, explains,
          and visualizes your database logic in plain language. Whether you're a developer,
          analyst, or product manager, get instant clarity with the help of AI.
        </p>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center mt-8">
          <div className="bg-gray-50 rounded-xl p-4 border hover:shadow-md">
            <h3 className="text-lg font-medium text-teal-600">Understand SQL</h3>
            <p className="text-sm text-gray-500">Natural language explanations of any query</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 border hover:shadow-md">
            <h3 className="text-lg font-medium text-teal-600">Visualize Schema</h3>
            <p className="text-sm text-gray-500">See relationships clearly in graph view</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 border hover:shadow-md">
            <h3 className="text-lg font-medium text-teal-600">AI-Powered Docs</h3>
            <p className="text-sm text-gray-500">Auto-generate documentation anytime</p>
          </div>
        </div>

        {/* Call to Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate("/chat")}
            className="px-8 py-3 bg-[#00857C] hover:bg-[#006f67] text-white text-lg font-medium rounded-full shadow-lg transition-transform transform hover:scale-105"
          >
            Start Exploring →
          </button>
          <button
            onClick={() => navigate("/model1")}
            className="px-8 py-3 bg-indigo-500 hover:bg-indigo-600 text-white text-lg font-medium rounded-full shadow-lg transition-transform transform hover:scale-105"
          >
            SQL Query Generator
          </button>
          <button
            onClick={() => navigate("/model2")}
            className="px-8 py-3 bg-purple-500 hover:bg-purple-600 text-white text-lg font-medium rounded-full shadow-lg transition-transform transform hover:scale-105"
          >
            SQL Explainer
          </button>
        </div>
      </div>

      {/* Footer Credits */}
      <div className="mt-12 text-sm text-gray-500 text-center">
        <p>
          Built as part of <strong>AT82.05 Natural Language Understanding</strong>, under the guidance of{" "}
          <strong>Dr. Chaklam Silpasuwanchai</strong>
        </p>
        <p>By Kaung Nyo Lwin, Phone Myint Naing, Khin Yadanar Hlaing</p>
      </div>
    </div>
  );
}

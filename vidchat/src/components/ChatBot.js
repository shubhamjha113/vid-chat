// src/components/Chatbot.jsx

import { useState, useEffect, useRef } from "react";
import { getGeminiResponse } from "../utils/geminiApi";
import { motion, AnimatePresence } from "framer-motion";

const Chatbot = ({ videoTitle, videoId, channelTitle }) => {
  const [query, setQuery] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const handleSend = async () => {
    if (!query.trim()) return;

    const userMessage = { role: "user", text: query };
    setChat((prev) => [...prev, userMessage]);
    setLoading(true);

    const prompt = `
      You are an expert content summarizer. 
      Based on the YouTube video titled "${videoTitle}", created by channel "${channelTitle}", briefly answer the user’s question in 4-5 clear lines. 
      Do not repeat the title or mention the video ID. Just provide a direct answer in simple language.
      
      Question: ${query}
    `;

    const botResponse = await getGeminiResponse(prompt);
    const botMessage = { role: "bot", text: botResponse };

    setChat((prev) => [...prev, botMessage]);
    setQuery("");
    setLoading(false);
  };

  useEffect(() => {
  const el = chatEndRef.current;
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
}, [chat]);

  return (
    <div className="relative glow-box p-6 bg-slate-100 rounded-2xl shadow-2xl max-w-xl mx-auto overflow-hidden border border-white/20 bg-gradient-to-br from-white/40 to-blue-100/40 dark:from-indigo-900/30 dark:to-purple-800/30 backdrop-blur-lg">

      <h3 className="text-xl font-bold mb-4 text-center text-gray-800 dark:text-white">
        💬 Ask anything about this video
      </h3>

      <div className="h-[300px] overflow-y-auto mb-4 space-y-4 pr-2 custom-scrollbar">
        <AnimatePresence>
          {chat.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`rounded-lg px-4 py-2 max-w-[90%] ${
                msg.role === "user"
                  ? "ml-auto bg-blue-100 text-blue-800"
                  : "mr-auto bg-green-100 text-green-800"
              }`}
            >
              <strong>{msg.role === "user" ? "You" : "Gemini"}:</strong> {msg.text}
            </motion.div>
          ))}
        </AnimatePresence>
        {loading && (
          <motion.div
            className="mr-auto bg-green-100 text-green-800 px-4 py-2 rounded-lg max-w-[90%] flex items-center gap-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <span className="dot dot1"></span>
            <span className="dot dot2"></span>
            <span className="dot dot3"></span>
          </motion.div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 p-3 border rounded-lg dark:text-gray-900  focus:outline-none focus:ring-2 focus:ring-blue-400 bg-neutral-300"
          placeholder="Ask a question..."
          disabled={loading}
        />
        <motion.button
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          onClick={handleSend}
          className="bg-blue-600 text-white px-5 py-2 rounded-full shadow hover:bg-blue-700 disabled:bg-blue-300"
          disabled={loading}
        >
          {loading ? "..." : "Send"}
        </motion.button>
      </div>
    </div>
  );
};

export default Chatbot;

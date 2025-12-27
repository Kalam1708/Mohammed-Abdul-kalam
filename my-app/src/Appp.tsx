import { useState } from "react";
import axios from "axios";
import "./App2.css";

function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;

    setLoading(true);
    setError("");

    try {
      // Add user message
      const newMessages = [...messages, { sender: "user", text: input }];
      setMessages(newMessages);
      setInput("");

      // Send to backend
      const response = await axios.post("http://localhost:3001/api/chat", {
        message: input,
      });

      // Add bot reply
      newMessages.push({ sender: "bot", text: response.data.reply });
      setMessages(newMessages);
    } catch (err) {
      const errorMessage = axios.isAxiosError(err) 
        ? err.response?.data?.error || "Failed to get response from server"
        : "An error occurred";
      setError(errorMessage);
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chat-container">
      <h2>React Chatbot 🤖</h2>

      {error && <div className="error-message">{error}</div>}

      <div className="chat-box">
        {messages.map((msg, index) => (
          <p
            key={index}
            className={msg.sender === "user" ? "user-msg" : "bot-msg"}
          >
            {msg.text}
          </p>
        ))}
        {loading && <p className="bot-msg">Bot is thinking...</p>}
      </div>

      <div className="input-box">
        <input
          type="text"
          placeholder="Say something..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
        />
        <button onClick={sendMessage} disabled={loading}>
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}

export default App;

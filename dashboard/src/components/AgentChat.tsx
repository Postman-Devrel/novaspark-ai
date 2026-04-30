import { useState, useRef, useEffect } from "react";
import type { Agent, ChatMessage } from "../types";
import "./AgentChat.css";

interface Props {
  agent: Agent;
  onClose: () => void;
}

export default function AgentChat({ agent, onClose }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "agent",
      content: `Hey! I'm ${agent.name} — ${agent.description} What can I help you with?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg: ChatMessage = { role: "user", content: input.trim(), timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`http://localhost:3000`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.content }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "agent", content: data.response, timestamp: new Date() },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "agent",
          content: `I'm not reachable right now — make sure I'm deployed on Astro AI. Run \`ast push\` in agents/${agent.id}/ to deploy me.`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="chat-panel" style={{ "--accent": agent.color } as React.CSSProperties}>
        <div className="chat-header">
          <div className="chat-agent-info">
            <span className="chat-emoji">{agent.emoji}</span>
            <div>
              <span className="chat-name">{agent.name}</span>
              <span className="chat-dept">{agent.department} · {agent.role}</span>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="chat-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`msg msg-${msg.role}`}>
              {msg.role === "agent" && (
                <span className="msg-avatar">{agent.emoji}</span>
              )}
              <div className="msg-bubble">{msg.content}</div>
            </div>
          ))}
          {loading && (
            <div className="msg msg-agent">
              <span className="msg-avatar">{agent.emoji}</span>
              <div className="msg-bubble typing">
                <span /><span /><span />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="chat-input-row">
          <input
            className="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder={`Message ${agent.name}...`}
            disabled={loading}
          />
          <button className="send-btn" onClick={send} disabled={loading || !input.trim()}>
            ↑
          </button>
        </div>
      </div>
    </div>
  );
}

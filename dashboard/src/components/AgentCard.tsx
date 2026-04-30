import type { Agent } from "../types";
import "./AgentCard.css";

interface Props {
  agent: Agent;
  onChat: (agent: Agent) => void;
}

export default function AgentCard({ agent, onChat }: Props) {
  return (
    <div className={`agent-card status-${agent.status}`} style={{ "--accent": agent.color } as React.CSSProperties}>
      <div className="agent-card-top">
        <div className="agent-avatar">
          <span className="agent-emoji">{agent.emoji}</span>
          <span className={`status-dot dot ${agent.status}`} />
        </div>
        <div className="agent-meta">
          <span className="agent-name">{agent.name}</span>
          <span className="agent-role">{agent.role}</span>
        </div>
        <div className="agent-tasks">
          <span className="tasks-count">{agent.tasksToday}</span>
          <span className="tasks-label">today</span>
        </div>
      </div>

      <p className="agent-description">{agent.description}</p>

      <div className="agent-tools">
        {agent.tools.map((tool) => (
          <span key={tool} className="tool-chip">{tool}</span>
        ))}
      </div>

      <div className="agent-card-footer">
        <span className="last-active">Active {agent.lastActive}</span>
        <button className="chat-btn" onClick={() => onChat(agent)}>
          Message →
        </button>
      </div>
    </div>
  );
}

import type { Agent } from "../types";
import AgentCard from "./AgentCard";
import "./AgentGrid.css";

interface Props {
  agents: Agent[];
  onChat: (agent: Agent) => void;
}

export default function AgentGrid({ agents, onChat }: Props) {
  const departments = [...new Set(agents.map((a) => a.department))];

  return (
    <div className="agent-grid-wrapper">
      <h2 className="section-title">Your AI Team</h2>
      {departments.map((dept) => (
        <div key={dept} className="dept-group">
          <div className="dept-label">{dept}</div>
          <div className="agent-grid">
            {agents
              .filter((a) => a.department === dept)
              .map((agent) => (
                <AgentCard key={agent.id} agent={agent} onChat={onChat} />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

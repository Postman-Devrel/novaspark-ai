import type { Agent } from "../types";
import "./StatsBar.css";

interface Props {
  agents: Agent[];
}

export default function StatsBar({ agents }: Props) {
  const online = agents.filter((a) => a.status === "online").length;
  const totalTasks = agents.reduce((sum, a) => sum + a.tasksToday, 0);
  const departments = new Set(agents.map((a) => a.department)).size;

  return (
    <div className="stats-bar">
      <div className="stat">
        <span className="stat-value">{agents.length}</span>
        <span className="stat-label">Total Agents</span>
      </div>
      <div className="stat-divider" />
      <div className="stat">
        <span className="stat-value online">{online}</span>
        <span className="stat-label">Online Now</span>
      </div>
      <div className="stat-divider" />
      <div className="stat">
        <span className="stat-value">{totalTasks}</span>
        <span className="stat-label">Tasks Today</span>
      </div>
      <div className="stat-divider" />
      <div className="stat">
        <span className="stat-value">{departments}</span>
        <span className="stat-label">Departments</span>
      </div>
    </div>
  );
}

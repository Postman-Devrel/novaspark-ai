export type AgentStatus = "online" | "idle" | "offline";

export interface Agent {
  id: string;
  name: string;
  department: string;
  role: string;
  emoji: string;
  status: AgentStatus;
  color: string;
  lastActive: string;
  tasksToday: number;
  description: string;
  tools: string[];
}

export interface ActivityEntry {
  id: string;
  agentId: string;
  agentName: string;
  agentEmoji: string;
  action: string;
  timestamp: Date;
  type: "task" | "deploy" | "alert" | "info";
}

export interface ChatMessage {
  role: "user" | "agent";
  content: string;
  timestamp: Date;
}

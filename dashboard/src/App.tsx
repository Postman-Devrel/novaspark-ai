import { useState } from "react";
import Header from "./components/Header";
import AgentGrid from "./components/AgentGrid";
import ActivityFeed from "./components/ActivityFeed";
import AgentChat from "./components/AgentChat";
import StatsBar from "./components/StatsBar";
import { AGENTS, ACTIVITY } from "./data";
import type { Agent } from "./types";
import "./App.css";

export default function App() {
  const [activeAgent, setActiveAgent] = useState<Agent | null>(null);
  const [chatOpen, setChatOpen] = useState(false);

  const handleOpenChat = (agent: Agent) => {
    setActiveAgent(agent);
    setChatOpen(true);
  };

  return (
    <div className="app">
      <Header />
      <main className="main">
        <StatsBar agents={AGENTS} />
        <div className="content">
          <div className="left">
            <AgentGrid agents={AGENTS} onChat={handleOpenChat} />
          </div>
          <div className="right">
            <ActivityFeed entries={ACTIVITY} />
          </div>
        </div>
      </main>
      {chatOpen && activeAgent && (
        <AgentChat agent={activeAgent} onClose={() => setChatOpen(false)} />
      )}
    </div>
  );
}

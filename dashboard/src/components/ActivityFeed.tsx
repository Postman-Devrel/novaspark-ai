import type { ActivityEntry } from "../types";
import "./ActivityFeed.css";

interface Props {
  entries: ActivityEntry[];
}

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function ActivityFeed({ entries }: Props) {
  return (
    <div className="activity-feed">
      <h2 className="section-title">Activity Feed</h2>
      <div className="feed-list">
        {entries.map((entry) => (
          <div key={entry.id} className={`feed-entry type-${entry.type}`}>
            <div className="feed-agent-emoji">{entry.agentEmoji}</div>
            <div className="feed-content">
              <span className="feed-agent-name">{entry.agentName}</span>
              <p className="feed-action">{entry.action}</p>
              <span className="feed-time">{timeAgo(entry.timestamp)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

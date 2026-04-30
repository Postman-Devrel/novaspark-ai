# Testing NovaSpark AI Agents

Three ways to test agents, in order of setup effort:

---

## 1. Claude Code Slash Commands (zero setup)

Skills are already live. Open any Claude Code session in this repo and use:

| Command | Agent | Example |
|---------|-------|---------|
| `/blaze` | Marketing writer | `/blaze Write a LinkedIn post about AI agents` |
| `/pixel` | Visual director | `/pixel Create a DALL-E prompt for our homepage hero` |
| `/forge` | Code reviewer | `/forge Review this function: [paste code]` |
| `/compass` | HR onboarding | `/compass Create a 30-day plan for a new contractor` |
| `/stride` | Sales outreach | `/stride Write a cold email for a Series A fintech VP` |
| `/ledger` | Finance | `/ledger Categorize: Anthropic $120, Vercel $20, Notion $8` |

No API key needed — runs through your existing Claude Code session.

---

## 2. MCP Plugin (all 6 agents as tools in Claude Code)

### Setup

```bash
# Install MCP server deps
cd mcp-server && bun install
```

Make sure `ANTHROPIC_API_KEY` is set in your shell:

```bash
export ANTHROPIC_API_KEY=sk-ant-...
```

The server is already registered in `.claude/settings.local.json`. Restart Claude Code — the tools `ask_blaze`, `ask_pixel`, `ask_forge`, `ask_compass`, `ask_stride`, `ask_ledger` will appear automatically.

### Verify it's working

In a Claude Code session, ask: *"What NovaSpark tools do you have available?"* — you should see all 6 listed.

### Test a tool directly

```bash
# Run the MCP server standalone to verify it starts
cd mcp-server && bun run index.ts
# Should hang waiting for stdio input — that means it started correctly. Ctrl+C to exit.
```

---

## 3. HTTP (test the deployed agent server directly)

Run any agent locally and hit its HTTP endpoint with curl.

### Quick start (Blaze example)

```bash
# Terminal 1 — start the agent
cd agents/blaze
bun install
ANTHROPIC_API_KEY=sk-ant-... bun agent/index.ts
# 🔥 Blaze is live on port 3000

# Terminal 2 — test it
curl -s -X POST http://localhost:3000 \
  -H "Content-Type: application/json" \
  -d '{"message": "Write a tweet about AI agents replacing entire ops teams"}' \
  | jq .response
```

### Test all agents

Each agent runs on port 3000 by default. Run them one at a time, or set `PORT=300X` to run multiple simultaneously.

```bash
# Forge — review a code snippet
curl -s -X POST http://localhost:3000 \
  -H "Content-Type: application/json" \
  -d '{"message": "Review this: const q = `SELECT * FROM users WHERE id = ${req.params.id}`"}' \
  | jq .response

# Stride — write outreach
curl -s -X POST http://localhost:3000 \
  -H "Content-Type: application/json" \
  -d '{"message": "Write a 3-email cold sequence for a VP Ops at a 50-person logistics startup"}' \
  | jq .response

# Ledger — with CSV
curl -s -X POST http://localhost:3000 \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Categorize these and flag anomalies",
    "csv": "date,vendor,amount\n2026-04-01,Anthropic,120\n2026-04-02,Vercel,20\n2026-04-02,Vercel,20\n2026-04-03,AWS,580"
  }' \
  | jq .response
```

### Health check

```bash
curl http://localhost:3000
# NovaSpark AI — Blaze is ready.
```

---

## Environment Variables Reference

| Variable | Required by | Where to get it |
|----------|-------------|-----------------|
| `ANTHROPIC_API_KEY` | All agents, MCP server | console.anthropic.com |
| `GITHUB_TOKEN` | Forge | GitHub → Settings → Developer tokens |
| `SLACK_WEBHOOK_URL` | Forge | Slack → Apps → Incoming Webhooks |
| `NOTION_API_KEY` | Compass | notion.so/my-integrations |
| `NOTION_PARENT_PAGE_ID` | Compass | Notion page URL (32-char ID) |
| `GOOGLE_API_KEY` | Ledger | Google Cloud Console |
| `ASTROPODS_TOKEN` | All (deploy only) | astropods.com → Settings |

For local testing, only `ANTHROPIC_API_KEY` is required. All other integrations gracefully stub when the env var is missing.

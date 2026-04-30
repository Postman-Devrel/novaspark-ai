# Blaze — Skills & Usage

## Claude Code Slash Command

```
/blaze <your request>
```

Invoke Blaze directly inside any Claude Code session. No deployment needed.

### Examples

```
/blaze Write a LinkedIn post announcing our AI agent platform launch

/blaze Draft a 5-email cold sequence for B2B SaaS ops leaders

/blaze Write a 900-word blog post: "Why solo founders are winning in 2026"

/blaze Create a Twitter thread about the future of AI agents in startups

/blaze Write the weekly newsletter for the week of April 30, 2026 — topics: agent deployments, cold outreach tips

/blaze Landing page headline and 3 subheadlines for NovaSpark's homepage
```

## MCP Tool

When the NovaSpark MCP server is running, Blaze is available as the `ask_blaze` tool.

```json
{
  "tool": "ask_blaze",
  "arguments": {
    "message": "Write a LinkedIn post about deploying AI agents as a solo founder"
  }
}
```

## Test Locally (HTTP)

```bash
# 1. Install deps
cd agents/blaze && bun install

# 2. Run the agent server
ANTHROPIC_API_KEY=sk-ant-... bun agent/index.ts
# 🔥 Blaze is live on port 3000

# 3. Send a message
curl -s -X POST http://localhost:3000 \
  -H "Content-Type: application/json" \
  -d '{"message": "Write a tweet about AI agents replacing entire departments"}' \
  | jq .response
```

## Deploy to Astro AI

```bash
cd agents/blaze
ast push
```

Requires `ASTROPODS_TOKEN` and `ANTHROPIC_API_KEY` in your environment or Astro AI secrets.

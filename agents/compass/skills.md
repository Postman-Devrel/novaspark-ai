# Compass — Skills & Usage

## Claude Code Slash Command

```
/compass <your request>
```

Invoke Compass directly inside any Claude Code session.

### Examples

```
/compass Create a 30-day onboarding plan for a new part-time TypeScript contractor

/compass What tools does NovaSpark use and how do they fit together?

/compass Write a Day 1 welcome message for an incoming design advisor

/compass What's the process for a new contractor to get set up with Notion, Slack, and GitHub?

/compass Create a 30-day plan for a content marketer joining 10 hours/week

/compass Write a Day 7 check-in message to send to our new frontend contractor
```

## MCP Tool

```json
{
  "tool": "ask_compass",
  "arguments": {
    "message": "Create a 30-day onboarding plan for a part-time sales development rep"
  }
}
```

## Test Locally (HTTP)

```bash
cd agents/compass && bun install

ANTHROPIC_API_KEY=sk-ant-... NOTION_API_KEY=secret_... bun agent/index.ts
# 🧭 Compass is live on port 3000

curl -s -X POST http://localhost:3000 \
  -H "Content-Type: application/json" \
  -d '{"message": "Create a 30-day onboarding plan for a new TypeScript contractor"}' \
  | jq .response
```

## Deploy to Astro AI

```bash
cd agents/compass
ast push
```

Required secrets: `ANTHROPIC_API_KEY`, `NOTION_API_KEY`, `NOTION_PARENT_PAGE_ID`.

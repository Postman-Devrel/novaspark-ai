# Stride — Skills & Usage

## Claude Code Slash Command

```
/stride <your request>
```

Invoke Stride directly inside any Claude Code session.

### Examples

```
/stride Write a 4-email cold sequence for a VP of Operations at a Series A logistics startup

/stride Draft a LinkedIn connection request for a CTO who just posted about scaling their ops team

/stride Research hook ideas for outreach to a fintech startup that just raised $8M Series A

/stride Write a break-up email (Email 4) for a prospect who hasn't replied in 2 weeks

/stride What are the best personalization angles for outreach to a company that just posted 10 engineering jobs?

/stride Rewrite this cold email to be 50% shorter and lead with value:
[paste email]
```

## MCP Tool

```json
{
  "tool": "ask_stride",
  "arguments": {
    "message": "Write a 3-email sequence for a Head of Engineering at a 50-person SaaS startup"
  }
}
```

## Test Locally (HTTP)

```bash
cd agents/stride && bun install

ANTHROPIC_API_KEY=sk-ant-... bun agent/index.ts
# 🚀 Stride is live on port 3000

curl -s -X POST http://localhost:3000 \
  -H "Content-Type: application/json" \
  -d '{"message": "Write a cold LinkedIn message for a VP Ops at Acme Corp who just posted about automation"}' \
  | jq .response
```

## Deploy to Astro AI

```bash
cd agents/stride
ast push
```

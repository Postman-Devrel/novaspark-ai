# Pixel — Skills & Usage

## Claude Code Slash Command

```
/pixel <your request>
```

Invoke Pixel directly inside any Claude Code session. No deployment needed.

### Examples

```
/pixel Create an image prompt for a hero banner: AI agents working as a team

/pixel What should our LinkedIn cover image look like for product launch week?

/pixel Generate 3 thumbnail concepts for a YouTube video titled "I replaced my team with AI"

/pixel Write a Midjourney prompt for a blog post hero: solo founder commanding AI agents

/pixel Audit this design: dark background, orange CTA button, white Inter font — does it match our brand?

/pixel Give me asset specs for a full LinkedIn profile kit (banner, post image, article cover)
```

## MCP Tool

```json
{
  "tool": "ask_pixel",
  "arguments": {
    "message": "Create a DALL-E 3 prompt for an AI startup homepage hero, 16:9"
  }
}
```

## Test Locally (HTTP)

```bash
cd agents/pixel && bun install

ANTHROPIC_API_KEY=sk-ant-... bun agent/index.ts
# 🎨 Pixel is live on port 3000

curl -s -X POST http://localhost:3000 \
  -H "Content-Type: application/json" \
  -d '{"message": "Write a Midjourney prompt for NovaSpark AI hero image"}' \
  | jq .response
```

## Deploy to Astro AI

```bash
cd agents/pixel
ast push
```

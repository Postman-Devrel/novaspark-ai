I'm building NovaSpark AI — a fictitious one-person company powered by AI agents 
deployed on Astro AI (astropods.com). Here's the project context:

COMPANY: NovaSpark AI — B2B SaaS startup, tagline "Igniting Ideas, Automating Everything"
STORY: I am a solo founder. My team = me + 6 AI agents across 5 departments, all deployed on Astro AI.

REPO: github.com/YOUR_USERNAME/novaspark-ai
PLATFORM: Astro AI (astropods.com) — agents defined in astropods.yml, deployed with `ast push`
MODEL: Anthropic Claude (claude-sonnet-4-20250514) for all agents
FRAMEWORK: Mastra (TypeScript)

AGENTS:
- Blaze (Marketing) — content writer: blogs, social posts, newsletters. Tools: Claude, web search, LinkedIn
- Pixel (Marketing) — brand & visual direction, image prompts. Tools: Claude Vision, Google Drive
- Forge (Development) — PR/code reviewer. Tools: Claude, GitHub API, Slack
- Compass (HR) — onboarding guide, Day 1-30 plans. Tools: Claude, Notion, Google Calendar, knowledge base
- Stride (Sales) — outreach agent, cold email + LinkedIn sequences. Tools: Claude, web search
- Ledger (Finance) — expense categorizer, anomaly detection. Tools: Claude, CSV parser, Google Sheets

REPO STRUCTURE:
novaspark-ai/
├── agents/blaze/    (astropods.yml, AGENT.md, Dockerfile, agent/index.ts)
├── agents/pixel/
├── agents/forge/
├── agents/compass/
├── agents/stride/
├── agents/ledger/
├── dashboard/       (React/Vite interactive HQ)
└── .github/workflows/deploy.yml

CURRENT STATUS: Repo structure created. Next step = build agent code + dashboard.

ASTROPODS.YML PATTERN:
spec: package/v1
name: <agent-name>
meta:
  visibility: private
agent:
  build:
    context: .
    dockerfile: Dockerfile
  interfaces:
    messaging: true
  dev:
    command: bun --watch agent/index.ts
models:
  main:
    provider: anthropic
    models: [claude-sonnet-4-20250514]
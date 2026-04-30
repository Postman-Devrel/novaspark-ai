import Anthropic from "@anthropic-ai/sdk";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const MODEL = "claude-sonnet-4-20250514";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── System prompts (mirrors agents/<name>/agent/index.ts) ──────────────────

const SYSTEM_PROMPTS: Record<string, string> = {
  blaze: `You are Blaze, NovaSpark AI's Marketing Content Agent.
NovaSpark AI is a B2B SaaS startup — "Igniting Ideas, Automating Everything."
A one-person company where the founder's team is 6 AI agents across 5 departments.

Write compelling, on-brand marketing content:
- Blog posts (500–2000 words, SEO-optimized)
- LinkedIn posts (150–300 words, short paragraphs, line breaks)
- Twitter/X threads (numbered, under 280 chars per tweet)
- Email newsletters (subject + preview text + body)
- Cold email sequences (labeled Email 1/2/3, under 100 words each)
- Landing page copy and CTAs

TONE: Energetic, confident, jargon-free, always end with a CTA.
AUDIENCE: Founders, ops leaders, CTOs at 10–500 person B2B companies.`,

  pixel: `You are Pixel, NovaSpark AI's Brand & Visual Direction Agent.
BRAND: Electric indigo (#6366F1), Spark orange (#F97316), Deep space (#0F172A), Cloud white (#F8FAFC).
Typography: Inter headings, Geist Mono for code. Vibe: modern, bold, slightly futuristic.
NEVER: stock-photo corporate, pastel palettes, cluttered layouts.

Output one of:
1. IMAGE PROMPT — "[Subject], [style], [lighting], [composition], [palette], [mood], [aspect ratio]"
2. VISUAL DIRECTION — layout, hierarchy, whitespace description for designers
3. BRAND AUDIT — evaluate against brand standards, be specific
4. ASSET SPECS — dimensions, formats, naming conventions`,

  forge: `You are Forge, NovaSpark AI's Code Review Agent.
You are the engineering quality gate. Direct, technical, specific. No fluff.

Review checklist: security (OWASP top 10, hardcoded secrets), correctness (bugs, null safety),
quality (no any without comment, no console.log in prod), tests (new features need tests),
dependencies (pinned versions), env vars (never hardcoded), performance (N+1, unbounded loops).

OUTPUT FORMAT:
VERDICT: ✅ APPROVED | ⚠️ CHANGES REQUESTED | 🚫 BLOCKED
🔴 Critical / 🟡 Major / 🟢 Minor issues
SUMMARY: 1-2 sentences on overall quality.`,

  compass: `You are Compass, NovaSpark AI's HR Onboarding Agent.
Create Day 1-30 onboarding plans, answer "how do we do things here" questions.

30-DAY FRAMEWORK:
Days 1–3: Orientation | Days 4–7: Understanding | Days 8–14: First deliverable
Days 15–21: Expansion | Days 22–30: Independence

NOVASPARK STACK: TypeScript, Bun, Mastra, React/Vite, Astro AI, GitHub Actions,
Slack, Notion, Figma, Linear, Google Sheets.

Output plans with tables and checklists. Name actual tools, actual tasks, concrete success criteria.`,

  stride: `You are Stride, NovaSpark AI's Sales Outreach Agent.
NovaSpark sells AI agent deployment to B2B companies.

ICP: 10–500 employees, B2B SaaS/fintech/ops-heavy, buyer = Founder/VP Ops/CTO.
Pain: scaling without hiring. Triggers: funding, hiring surge, product launch.

SEQUENCE: Email 1 (hook + value + soft CTA) → Email 2 Day 3 (different angle) →
Email 3 Day 7 (direct ask) → Email 4 Day 14 (break-up).

Rules: personalize first line, max 5 sentences per email, one CTA only.
Label each email. Include subject line. Flag [personalization placeholders].`,

  ledger: `You are Ledger, NovaSpark AI's Finance Agent.
Categorize expenses, detect anomalies, generate summaries. Meticulous and precise.

CATEGORIES: Infrastructure | Tools & SaaS | AI & APIs | Marketing | People |
Legal & Admin | Travel & Events | Misc (flag, don't auto-categorize).

ANOMALY FLAGS: transactions >$500 not in prior months, duplicates within 7 days, new vendors.

OUTPUT: Markdown table (Date | Vendor | Amount | Category | Notes),
then ⚠️ Flags section, then subtotals by category + grand total.
Exact figures — no rounding unless asked.`,
};

// ── Tool definitions ───────────────────────────────────────────────────────

const TOOLS = [
  {
    name: "ask_blaze",
    description:
      "Ask Blaze (Marketing Content Agent) to write blogs, social posts, newsletters, cold emails, or landing page copy for NovaSpark AI.",
    inputSchema: {
      type: "object",
      properties: {
        message: { type: "string", description: "Your content request" },
      },
      required: ["message"],
    },
  },
  {
    name: "ask_pixel",
    description:
      "Ask Pixel (Visual Direction Agent) for image generation prompts, brand guidelines, visual audits, or asset specs.",
    inputSchema: {
      type: "object",
      properties: {
        message: { type: "string", description: "Your visual direction request" },
      },
      required: ["message"],
    },
  },
  {
    name: "ask_forge",
    description:
      "Ask Forge (Code Review Agent) to review code, diffs, or PR descriptions for bugs, security issues, and quality.",
    inputSchema: {
      type: "object",
      properties: {
        message: {
          type: "string",
          description: "Code, diff, or description to review",
        },
      },
      required: ["message"],
    },
  },
  {
    name: "ask_compass",
    description:
      "Ask Compass (HR Onboarding Agent) to create onboarding plans, answer process questions, or draft welcome messages.",
    inputSchema: {
      type: "object",
      properties: {
        message: { type: "string", description: "Your HR or onboarding request" },
      },
      required: ["message"],
    },
  },
  {
    name: "ask_stride",
    description:
      "Ask Stride (Sales Outreach Agent) to write cold email sequences, LinkedIn messages, or research outreach hooks.",
    inputSchema: {
      type: "object",
      properties: {
        message: { type: "string", description: "Your sales outreach request" },
      },
      required: ["message"],
    },
  },
  {
    name: "ask_ledger",
    description:
      "Ask Ledger (Finance Agent) to categorize expenses, detect anomalies, or generate spending summaries.",
    inputSchema: {
      type: "object",
      properties: {
        message: {
          type: "string",
          description: "Your finance request — include expense data inline if categorizing",
        },
      },
      required: ["message"],
    },
  },
] as const;

// ── Call an agent via Anthropic API ───────────────────────────────────────

async function callAgent(agentId: string, message: string): Promise<string> {
  const systemPrompt = SYSTEM_PROMPTS[agentId];
  if (!systemPrompt) throw new Error(`Unknown agent: ${agentId}`);

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 2048,
    system: systemPrompt,
    messages: [{ role: "user", content: message }],
  });

  const block = response.content[0];
  if (block.type !== "text") throw new Error("Unexpected response type from Claude");
  return block.text;
}

// ── MCP Server ────────────────────────────────────────────────────────────

const server = new Server(
  { name: "novaspark-ai", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  const agentId = name.replace("ask_", "");
  const message = (args as { message: string }).message;

  try {
    const result = await callAgent(agentId, message);
    return { content: [{ type: "text", text: result }] };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);

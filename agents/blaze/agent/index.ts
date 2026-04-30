import { Agent } from "@mastra/core/agent";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const webSearchTool = createTool({
  id: "web-search",
  description: "Search the web for research, trends, and competitor content",
  inputSchema: z.object({ query: z.string().describe("Search query") }),
  execute: async ({ context }) => {
    // Stub — wire to your search provider (Brave, Tavily, etc.)
    return { results: `Web search results for: ${context.query}` };
  },
});

export const blaze = new Agent({
  name: "Blaze",
  instructions: `You are Blaze, NovaSpark AI's Marketing Content Agent.

NovaSpark AI is a B2B SaaS startup with the tagline "Igniting Ideas, Automating Everything."
We are a one-person company powered by AI agents. Our founder is building the future of
solo entrepreneurship with an AI-powered team.

YOUR JOB: Write compelling, on-brand marketing content that drives awareness, engagement,
and leads for NovaSpark AI.

TONE & VOICE:
- Energetic and confident — we're a startup that moves fast
- Clear and jargon-free — respect the reader's time
- Data-informed when possible — back claims with evidence
- Always end with a clear call to action

CONTENT TYPES YOU WRITE:
- Blog posts (500–2000 words, SEO-optimized)
- LinkedIn posts (professional, thought-leadership)
- Twitter/X threads (punchy, quotable)
- Email newsletters (weekly roundups, product updates)
- Cold email copy (concise, personalized)
- Landing page copy and headlines

BRAND COLORS: Electric indigo, spark orange, deep space, cloud white.

When writing, always ask: "Does this ignite ideas? Does it show how we automate everything?"
If the answer is yes, ship it.`,
  model: anthropic("claude-sonnet-4-20250514"),
  tools: { webSearch: webSearchTool },
});

// Astro AI messaging interface
const server = Bun.serve({
  port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
  async fetch(req) {
    if (req.method !== "POST") {
      return new Response("NovaSpark AI — Blaze is ready.", { status: 200 });
    }

    const { message } = await req.json();
    if (!message) {
      return new Response(JSON.stringify({ error: "message required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const response = await blaze.generate(message);
    return new Response(JSON.stringify({ response: response.text }), {
      headers: { "Content-Type": "application/json" },
    });
  },
});

console.log(`🔥 Blaze is live on port ${server.port}`);

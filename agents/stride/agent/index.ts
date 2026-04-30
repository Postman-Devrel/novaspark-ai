import { Agent } from "@mastra/core/agent";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const webSearchTool = createTool({
  id: "web-search",
  description: "Research a prospect, company, or industry for outreach personalization",
  inputSchema: z.object({
    query: z.string().describe("Search query for prospect research"),
  }),
  execute: async ({ context }) => {
    // Stub — wire to Brave Search, Tavily, or Exa API
    return { results: `Research results for: ${context.query}` };
  },
});

const linkedinTool = createTool({
  id: "linkedin-profile",
  description: "Fetch public LinkedIn profile data for a prospect",
  inputSchema: z.object({
    profileUrl: z.string().url().describe("LinkedIn profile URL"),
  }),
  execute: async ({ context }) => {
    // Stub — wire to LinkedIn API or scraper
    return { profile: `Profile data for: ${context.profileUrl}` };
  },
});

export const stride = new Agent({
  name: "Stride",
  instructions: `You are Stride, NovaSpark AI's Sales Outreach Agent.

NovaSpark AI sells AI agent deployment infrastructure to B2B companies.
Your job: fill the pipeline with qualified leads through targeted, personalized outreach.

IDEAL CUSTOMER PROFILE (ICP):
- Company size: 10–500 employees
- Industry: B2B SaaS, fintech, ops-heavy businesses (logistics, e-commerce, professional services)
- Buyer: Founders, VPs of Operations, CTOs, Heads of Engineering
- Pain: "We're drowning in manual work but can't afford to hire 10 more people"
- Trigger events: Recent funding round, rapid hiring, new product launch, leadership change

OUTREACH PRINCIPLES:
1. PERSONALIZE first line — reference something specific (recent blog, job posting, funding news)
2. SHORT — 3-5 sentences max for cold email, 2-3 for LinkedIn
3. VALUE > ASK — lead with what they get, not what you want
4. ONE CTA — never ask for a meeting AND a reply AND a demo all at once
5. FOLLOW-UP is not pestering if it adds value each time

EMAIL SEQUENCE STRUCTURE:
- Email 1: Hook + value prop + soft CTA (reply, not book a call)
- Email 2 (Day 3): Different angle + social proof or case study
- Email 3 (Day 7): Short "still relevant?" + direct ask
- Email 4 (Day 14): Break-up email — closes the loop, keeps the door open

NOVASPARK VALUE PROPS:
- "Deploy your first AI agent in under an hour"
- "A full AI-powered operations team for less than one FTE salary"
- "6 specialized agents covering marketing, sales, engineering, HR, and finance"

Never be salesy or pushy. Be a peer who spotted a relevant opportunity for them.`,
  model: anthropic("claude-sonnet-4-20250514"),
  tools: { webSearch: webSearchTool, linkedin: linkedinTool },
});

const server = Bun.serve({
  port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
  async fetch(req) {
    if (req.method !== "POST") {
      return new Response("NovaSpark AI — Stride is ready.", { status: 200 });
    }

    const { message } = await req.json();
    if (!message) {
      return new Response(JSON.stringify({ error: "message required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const response = await stride.generate(message);
    return new Response(JSON.stringify({ response: response.text }), {
      headers: { "Content-Type": "application/json" },
    });
  },
});

console.log(`🚀 Stride is live on port ${server.port}`);

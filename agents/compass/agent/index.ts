import { Agent } from "@mastra/core/agent";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const notionTool = createTool({
  id: "notion-create-page",
  description: "Create a new page in Notion",
  inputSchema: z.object({
    title: z.string(),
    content: z.string(),
    parentPageId: z.string().optional(),
  }),
  execute: async ({ context }) => {
    const token = process.env.NOTION_API_KEY;
    const res = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28",
      },
      body: JSON.stringify({
        parent: { page_id: context.parentPageId || process.env.NOTION_PARENT_PAGE_ID },
        properties: { title: { title: [{ text: { content: context.title } }] } },
        children: [
          {
            object: "block",
            type: "paragraph",
            paragraph: { rich_text: [{ text: { content: context.content } }] },
          },
        ],
      }),
    });
    const data = await res.json();
    return { pageId: data.id, url: data.url };
  },
});

const calendarTool = createTool({
  id: "calendar-create-event",
  description: "Create a Google Calendar event for an onboarding checkpoint",
  inputSchema: z.object({
    title: z.string(),
    date: z.string().describe("ISO 8601 date-time"),
    description: z.string().optional(),
    attendees: z.array(z.string()).optional(),
  }),
  execute: async ({ context }) => {
    // Stub — wire to Google Calendar API
    return {
      created: true,
      event: {
        title: context.title,
        date: context.date,
        attendees: context.attendees,
      },
    };
  },
});

export const compass = new Agent({
  name: "Compass",
  instructions: `You are Compass, NovaSpark AI's HR Onboarding Agent.

NovaSpark AI is a one-person company. When new collaborators join (contractors, advisors,
part-time contributors), you make sure they hit the ground running with zero friction.

ONBOARDING PHILOSOPHY:
- Day 1 should feel exciting, not overwhelming
- Context before tasks — people need to understand the "why" before the "what"
- Clear milestones at Day 7, 15, and 30
- Async-first culture — document everything, assume people are in different timezones

30-DAY FRAMEWORK:
- Days 1-3: Orientation (tools setup, company context, team intro)
- Days 4-7: Understanding (product, users, roadmap, current priorities)
- Days 8-14: Contribution (first small, real deliverable)
- Days 15-21: Expansion (deeper involvement, opinions welcome)
- Days 22-30: Independence (running tasks solo, minimal hand-holding)

TOOLS & STACK AT NOVASPARK:
- Code: TypeScript, Bun, Mastra framework
- Deploy: Astro AI (astropods.com), GitHub Actions
- Comms: Slack
- Docs: Notion
- Design: Figma
- PM: Linear
- Finance: Google Sheets

CULTURE:
- Move fast, document thoroughly
- AI agents handle repetitive work — humans handle creative and strategic decisions
- No meetings that could be a Notion page
- Feedback is a gift — give it directly

When creating onboarding plans, be specific, not generic. Include actual tool names,
real deliverables, and concrete success criteria.`,
  model: anthropic("claude-sonnet-4-20250514"),
  tools: { notion: notionTool, calendar: calendarTool },
});

const server = Bun.serve({
  port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
  async fetch(req) {
    if (req.method !== "POST") {
      return new Response("NovaSpark AI — Compass is ready.", { status: 200 });
    }

    const { message } = await req.json();
    if (!message) {
      return new Response(JSON.stringify({ error: "message required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const response = await compass.generate(message);
    return new Response(JSON.stringify({ response: response.text }), {
      headers: { "Content-Type": "application/json" },
    });
  },
});

console.log(`🧭 Compass is live on port ${server.port}`);

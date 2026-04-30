import { Agent } from "@mastra/core/agent";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const driveSearchTool = createTool({
  id: "drive-search",
  description: "Search Google Drive for brand assets, past designs, and visual guidelines",
  inputSchema: z.object({
    query: z.string().describe("What to search for in Drive"),
  }),
  execute: async ({ context }) => {
    // Stub — wire to Google Drive API
    return { files: `Drive search results for: ${context.query}` };
  },
});

export const pixel = new Agent({
  name: "Pixel",
  instructions: `You are Pixel, NovaSpark AI's Brand & Visual Direction Agent.

NovaSpark AI is a B2B SaaS startup — "Igniting Ideas, Automating Everything."
Your job is to ensure everything NovaSpark creates looks stunning and on-brand.

BRAND IDENTITY:
- Colors: Electric indigo (#6366F1), Spark orange (#F97316), Deep space (#0F172A), Cloud white (#F8FAFC)
- Typography: Inter for headings, Geist Mono for code and accents
- Logo motif: Lightning bolt meeting a circuit node
- Vibe: Modern, bold, slightly futuristic — startup energy meets enterprise trust
- Never: stock-photo corporate, pastel palettes, Comic Sans, busy/cluttered layouts

YOUR CAPABILITIES:
1. IMAGE PROMPTS: Write precise, detailed prompts for DALL-E 3, Midjourney v6, or Stable Diffusion XL.
   Always specify: aspect ratio, style, lighting, composition, color palette, mood.

2. VISUAL DIRECTION: Describe how a design should look — layout, hierarchy, whitespace.

3. BRAND AUDITS: When shown an image or design description, evaluate against brand standards.

4. ASSET SPECS: Output exact dimensions, formats, and naming conventions for social, web, print.

PROMPT FORMAT (always use this structure):
"[Subject] in [style], [lighting], [composition], [color palette], [mood/atmosphere],
[technical specs: aspect ratio, resolution]"

Example: "Lightning bolt merging with a circuit board, cinematic product photography,
dramatic side lighting, deep space black background with electric indigo glow,
futuristic and powerful mood, 16:9 aspect ratio, ultra sharp"`,
  model: anthropic("claude-sonnet-4-20250514"),
  tools: { driveSearch: driveSearchTool },
});

const server = Bun.serve({
  port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
  async fetch(req) {
    if (req.method !== "POST") {
      return new Response("NovaSpark AI — Pixel is ready.", { status: 200 });
    }

    const { message } = await req.json();
    if (!message) {
      return new Response(JSON.stringify({ error: "message required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const response = await pixel.generate(message);
    return new Response(JSON.stringify({ response: response.text }), {
      headers: { "Content-Type": "application/json" },
    });
  },
});

console.log(`🎨 Pixel is live on port ${server.port}`);

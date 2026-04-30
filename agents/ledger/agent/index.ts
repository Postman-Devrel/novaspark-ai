import { Agent } from "@mastra/core/agent";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const csvParseTool = createTool({
  id: "parse-csv",
  description: "Parse a CSV string of expense transactions",
  inputSchema: z.object({
    csv: z.string().describe("Raw CSV content with expense data"),
  }),
  execute: async ({ context }) => {
    const lines = context.csv.trim().split("\n");
    const headers = lines[0].split(",").map((h) => h.trim());
    const rows = lines.slice(1).map((line) => {
      const values = line.split(",").map((v) => v.trim());
      return Object.fromEntries(headers.map((h, i) => [h, values[i]]));
    });
    return { rows, count: rows.length };
  },
});

const sheetsTool = createTool({
  id: "sheets-write",
  description: "Write categorized expense data to a Google Sheets spreadsheet",
  inputSchema: z.object({
    spreadsheetId: z.string(),
    range: z.string().describe("e.g. Sheet1!A1"),
    values: z.array(z.array(z.string())),
  }),
  execute: async ({ context }) => {
    const token = process.env.GOOGLE_API_KEY;
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${context.spreadsheetId}/values/${context.range}:append?valueInputOption=USER_ENTERED&key=${token}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ values: context.values }),
    });
    return { ok: res.ok, status: res.status };
  },
});

export const ledger = new Agent({
  name: "Ledger",
  instructions: `You are Ledger, NovaSpark AI's Finance Agent.

You keep NovaSpark's books clean so the founder can focus on building, not bookkeeping.
You are meticulous, precise, and flag anything that looks off.

EXPENSE CATEGORIES:
- Infrastructure: AWS, Vercel, Astro AI (astropods.com), GitHub, Cloudflare, databases
- Tools & SaaS: Notion, Linear, Figma, Loom, Slack, 1Password, analytics tools
- AI & APIs: Anthropic API, OpenAI API, other AI service costs
- Marketing: Ads (Google, LinkedIn, Meta), sponsorships, SEO tools, content tools
- People: Contractor payments, advisor retainers, freelance invoices
- Legal & Admin: Incorporation fees, trademark filings, accounting software, legal counsel
- Travel & Entertainment: Conferences, client meetings, business meals
- Misc: Flag these for founder review — do not auto-categorize ambiguous items

ANOMALY FLAGS (always highlight):
- Any single transaction over $500 not in the approved budget
- Duplicate charges (same vendor, same amount within 7 days)
- Subscriptions that haven't been used in 30+ days (if inferable)
- Transactions outside normal business hours (potential fraud indicator)
- Vendors not previously seen in the ledger

OUTPUT FORMAT for expense categorization:
| Date | Vendor | Amount | Category | Notes |
List anomalies separately after the table.
End with a summary: total by category, total spend, anomaly count.

For monthly summaries, include MoM comparison if prior month data is available.
Always output exact numbers — no rounding unless asked.`,
  model: anthropic("claude-sonnet-4-20250514"),
  tools: { parseCsv: csvParseTool, sheets: sheetsTool },
});

const server = Bun.serve({
  port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
  async fetch(req) {
    if (req.method !== "POST") {
      return new Response("NovaSpark AI — Ledger is ready.", { status: 200 });
    }

    const { message, csv } = await req.json();
    if (!message) {
      return new Response(JSON.stringify({ error: "message required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const input = csv ? `${message}\n\nExpense data:\n${csv}` : message;
    const response = await ledger.generate(input);
    return new Response(JSON.stringify({ response: response.text }), {
      headers: { "Content-Type": "application/json" },
    });
  },
});

console.log(`📊 Ledger is live on port ${server.port}`);

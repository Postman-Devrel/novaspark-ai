import { Agent } from "@mastra/core/agent";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const githubPRTool = createTool({
  id: "github-get-pr",
  description: "Fetch a GitHub pull request diff and metadata",
  inputSchema: z.object({
    owner: z.string(),
    repo: z.string(),
    prNumber: z.number(),
  }),
  execute: async ({ context }) => {
    const token = process.env.GITHUB_TOKEN;
    const res = await fetch(
      `https://api.github.com/repos/${context.owner}/${context.repo}/pulls/${context.prNumber}`,
      { headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github.v3.diff" } }
    );
    return { diff: await res.text() };
  },
});

const githubCommentTool = createTool({
  id: "github-post-comment",
  description: "Post a review comment on a GitHub pull request",
  inputSchema: z.object({
    owner: z.string(),
    repo: z.string(),
    prNumber: z.number(),
    body: z.string(),
    event: z.enum(["APPROVE", "REQUEST_CHANGES", "COMMENT"]),
  }),
  execute: async ({ context }) => {
    const token = process.env.GITHUB_TOKEN;
    const res = await fetch(
      `https://api.github.com/repos/${context.owner}/${context.repo}/pulls/${context.prNumber}/reviews`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ body: context.body, event: context.event }),
      }
    );
    return { ok: res.ok, status: res.status };
  },
});

const slackTool = createTool({
  id: "slack-post",
  description: "Post a message to a Slack channel",
  inputSchema: z.object({
    channel: z.string(),
    text: z.string(),
  }),
  execute: async ({ context }) => {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;
    if (!webhookUrl) return { ok: false, error: "SLACK_WEBHOOK_URL not set" };
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel: context.channel, text: context.text }),
    });
    return { ok: res.ok };
  },
});

export const forge = new Agent({
  name: "Forge",
  instructions: `You are Forge, NovaSpark AI's Code Review Agent.

You are the engineering quality gate for NovaSpark AI. Every line of code that ships
must meet high standards — you enforce that.

REVIEW CHECKLIST (apply to every PR):
1. SECURITY: Check for hardcoded secrets, SQL injection, XSS, unsafe eval, OWASP top 10
2. CORRECTNESS: Logic bugs, off-by-one errors, unhandled edge cases, null safety
3. QUALITY: No any types without explanation, no console.log in production code
4. TESTS: New features must have tests; critical paths must not regress
5. DEPENDENCIES: No unpinned versions, no suspicious new packages
6. ENV VARS: All config via environment variables, never hardcoded
7. PERFORMANCE: Obvious N+1 queries, unbounded loops, missing indexes

OUTPUT FORMAT:
- Start with a one-line verdict: ✅ APPROVED / ⚠️ CHANGES REQUESTED / 🚫 BLOCKED
- List issues by severity: 🔴 Critical > 🟡 Major > 🟢 Minor
- End with an actionable summary

TONE: Direct and technical. No fluff. Developers respect honest, specific feedback.
If it's good, say so briefly. If it has problems, be specific about what and why.`,
  model: anthropic("claude-sonnet-4-20250514"),
  tools: { githubPR: githubPRTool, githubComment: githubCommentTool, slack: slackTool },
});

const server = Bun.serve({
  port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
  async fetch(req) {
    if (req.method !== "POST") {
      return new Response("NovaSpark AI — Forge is ready.", { status: 200 });
    }

    const { message } = await req.json();
    if (!message) {
      return new Response(JSON.stringify({ error: "message required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const response = await forge.generate(message);
    return new Response(JSON.stringify({ response: response.text }), {
      headers: { "Content-Type": "application/json" },
    });
  },
});

console.log(`⚙️  Forge is live on port ${server.port}`);

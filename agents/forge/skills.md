# Forge — Skills & Usage

## Claude Code Slash Command

```
/forge <code or PR diff to review>
```

Invoke Forge directly inside any Claude Code session. Paste a diff, a function, or a file.

### Examples

```
/forge Review this TypeScript function for bugs and security issues:
[paste code]

/forge Is this API endpoint safe? Check for injection and auth issues:
[paste code]

/forge Review this PR diff — focus on correctness and missing tests:
[paste diff]

/forge Check this package.json for unpinned deps or suspicious packages:
[paste package.json]

/forge Does this SQL query have any injection risks?
SELECT * FROM users WHERE email = '${email}'
```

## MCP Tool

```json
{
  "tool": "ask_forge",
  "arguments": {
    "message": "Review this function:\n\nconst getUser = (id) => db.query(`SELECT * FROM users WHERE id = ${id}`)"
  }
}
```

## Test Locally (HTTP)

```bash
cd agents/forge && bun install

ANTHROPIC_API_KEY=sk-ant-... GITHUB_TOKEN=ghp_... bun agent/index.ts
# ⚙️  Forge is live on port 3000

curl -s -X POST http://localhost:3000 \
  -H "Content-Type: application/json" \
  -d '{"message": "Review: const x: any = req.body; eval(x.script)"}' \
  | jq .response
```

## Deploy to Astro AI

```bash
cd agents/forge
ast push
```

Required secrets: `ANTHROPIC_API_KEY`, `GITHUB_TOKEN` (with `pull_requests:write`), `SLACK_WEBHOOK_URL`.

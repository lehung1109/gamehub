<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Evidence and freshness rules

## Source priority
1. Current project code and local docs.
2. Installed package docs and generated docs in `node_modules/.../docs/`.
3. Official vendor documentation and official release notes.
4. Other reputable web sources.
5. Training knowledge only as background, never as the final source for time-sensitive facts.

## Mandatory retrieval
You MUST verify with current sources before answering or coding when the task involves:
- Next.js, React, TypeScript, package APIs, or framework behavior that may have changed.
- Version-specific behavior, migrations, deprecations, release notes, config changes, or error messages.
- Any request using words like "latest", "current", "new", "recent", "now", or "today".

## Conflict handling
If retrieved sources conflict with training knowledge, prefer retrieved sources.
If sources conflict with each other, say so explicitly and ask for confirmation or use the official source.

## Coding behavior
Before changing code that depends on framework behavior, read the relevant local Next.js docs first.
Do not guess APIs, file conventions, or config shapes from memory.
When using web sources, prefer official docs over blogs.
State uncertainty explicitly when evidence is weak or incomplete.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Repository agent rules

## Working principles
- Treat project files, checked-in docs, and explicit user instructions as the primary source of truth.
- Treat training knowledge as background only, not as the final authority for version-sensitive, time-sensitive, or project-specific facts.
- Prefer retrieved or local evidence over memory whenever current behavior, APIs, dependencies, configs, policies, or release details may have changed.
- If evidence is missing or conflicting, say so explicitly and avoid guessing.

## Source priority
1. User instructions and the current task.
2. Current repository code, configs, tests, and local documentation.
3. Installed dependency documentation, generated docs, and lockfiles.
4. Official vendor documentation, official release notes, and primary sources.
5. Reputable secondary sources.
6. Training knowledge for background and interpretation only.

## Retrieval rules
- Verify before answering or changing code when the task depends on current APIs, package behavior, framework conventions, versions, release notes, pricing, policies, or external service behavior.
- Do not rely on memory alone for anything described as latest, current, recent, new, now, or today.
- Prefer official documentation over blog posts or forum answers.
- When a claim affects implementation decisions, read the relevant source before coding.

## Conflict handling
- If retrieved or local evidence conflicts with training knowledge, prefer the evidence.
- If multiple sources conflict, prefer the most official and most recent source, and mention the conflict.
- If no reliable source is available, state uncertainty and choose the least risky path.

## Coding rules
- Do not guess file formats, API signatures, config shapes, migration steps, or CLI flags from memory.
- Read existing code and nearby tests before editing.
- Keep changes aligned with the current repository patterns unless the task explicitly asks for a new pattern.
- Make the smallest change that solves the task.

## Validation
- Run the smallest relevant validation first, then broader checks if needed.
- For code changes, prefer targeted tests, lint, and typecheck around the affected area.
- If validation cannot be run, explain what should be run and why.

## Boundaries
- Never invent facts, commands, versions, or URLs.
- Never overwrite broad areas of the codebase without checking scope and impact.
- Ask before destructive actions, schema changes, secret handling, or irreversible migrations.

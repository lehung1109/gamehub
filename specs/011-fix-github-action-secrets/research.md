# Research: fix-github-action-secrets

## Decision: Map GitHub Secrets to Workflow Environment Variables

- **Decision**: Update `.github/workflows/ci.yml` and `.github/workflows/e2e.yml` to replace hardcoded dummy Supabase values with dynamic secret injections (`${{ secrets.SECRET_NAME }}`).
- **Rationale**: The user has configured `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, and `SUPABASE_ACCESS_TOKEN` in their GitHub repository secrets. However, GitHub Actions does not automatically expose repository secrets to the workflow environment for security reasons. They must be explicitly mapped in the `env` block of the job. The existing workflows use dummy values (e.g., `https://example.supabase.co`), which causes the build/tests to fail when they try to connect to the real Supabase project. We will map the user's `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to the expected `NEXT_PUBLIC_SUPABASE_ANON_KEY` environment variable (as Next.js typically expects `NEXT_PUBLIC_SUPABASE_ANON_KEY`), or we will provide exactly the environment variables the user requested.
- **Alternatives considered**: Passing secrets at the individual step level (rejected because multiple steps like build and tests need the environment variables, so job-level `env` is cleaner and more DRY).

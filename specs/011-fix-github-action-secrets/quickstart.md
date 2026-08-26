# Quickstart Validation Guide: fix-github-action-secrets

This guide details how to validate that the GitHub Action secrets are properly configured.

## Prerequisites
- The GitHub repository must have the following secrets configured in Settings > Secrets and variables > Actions > Repository secrets:
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (or mapped to ANON_KEY depending on usage)
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `SUPABASE_ACCESS_TOKEN`

## Validation Steps

1. **Trigger a Workflow Run**:
   - Push a new commit to the `main` branch or open a new Pull Request.
   - Alternatively, navigate to the **Actions** tab in GitHub, select the **CI** or **E2E** workflow, and click **Run workflow** (if `workflow_dispatch` is enabled).

2. **Verify Execution**:
   - Monitor the workflow run in the GitHub Actions tab.
   - The **Build** step should succeed without errors relating to missing environment variables.
   - The **Unit Tests** and **Run E2E Tests** steps should pass, meaning the application successfully accessed the Supabase instance using the provided credentials.

3. **Expected Outcome**:
   - Both the `CI` and `E2E` workflows complete with a green checkmark (Success).

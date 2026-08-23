# Data Model: CI/CD Pipelines

**Feature**: 007-ci-cd-pipelines | **Date**: 2026-08-23

## Overview

This feature involves no database entities or application data models. It creates GitHub Actions workflow configuration files (YAML) and modifies a package.json script. No data is persisted, no entities are created, and no state transitions exist within the application.

## Configuration Artifacts

The following configuration artifacts are created:

### Workflow: ci.yml

- **Type**: GitHub Actions workflow definition (YAML)
- **Trigger events**: `pull_request` (opened, synchronize, reopened) and `push` to `main`
- **Steps**: Install dependencies → Lint → Typecheck → Unit tests → Build
- **Concurrency**: Grouped by workflow name + branch ref, cancel in-progress

### Workflow: e2e.yml

- **Type**: GitHub Actions workflow definition (YAML)
- **Trigger events**: `pull_request` (opened, synchronize, reopened) and `push` to `main`
- **Steps**: Install dependencies → Install Playwright browsers → Run E2E tests → Upload artifacts on failure
- **Concurrency**: Grouped by workflow name + branch ref, cancel in-progress

### Workflow: supabase.yml

- **Type**: GitHub Actions workflow definition (YAML)
- **Trigger events**: `pull_request` with path filter `supabase/migrations/**`
- **Steps**: Install dependencies → Run `supabase db lint`
- **Concurrency**: Grouped by workflow name + branch ref, cancel in-progress

### Script: build:ci

- **Type**: npm script in `package.json`
- **Command**: `next build`
- **Purpose**: Run Next.js build without remote Supabase type generation dependency

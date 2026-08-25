# Quickstart & Validation Guide

## Overview

This guide outlines the steps to validate the desktop responsive grid layout fix for the `TenseHubMap` component. The requirement ensures that the layout displays a maximum of 4 columns on desktop viewports (`lg`, `xl`, `2xl`) to improve card readability, while gracefully degrading to fewer columns on tablet/mobile.

## Prerequisites

1. Check out the feature branch: `git checkout 010-update-group-heading-cols`
2. Install dependencies: `npm install`
3. Start the dev server: `npm run dev`

## Manual Validation (Visual Verification)

1. Open your browser and navigate to the application where the Tense Hub Map is displayed (e.g., `/tenses` or the designated route).
2. Open the browser's Developer Tools (F12) and toggle the Device Toolbar / Responsive Design Mode.
3. Test the following viewports:
   - **Mobile** (`< 640px`): Verify the grid displays in **1 column**.
   - **Tablet** (`640px - 1023px`): Verify the grid displays in **2 columns**.
   - **Desktop LG** (`1024px - 1279px`): Verify the grid displays in **4 columns**.
   - **Desktop XL** (`1280px - 1535px`): Verify the grid remains at **4 columns**.
   - **Desktop 2XL** (`>= 1536px`): Verify the grid remains at **4 columns**.
4. Check the width of individual tense cards inside the "Present Tenses" group to ensure content and text readability is improved.

## Automated Validation (E2E Tests)

Run the Playwright E2E tests to verify the UI layout dynamically:

```bash
npm run test:e2e
```

*Note: You may need to create or modify an E2E test targeting the TenseHubMap view at different viewport widths to assert the expected number of visible columns based on the grid's computed style.*

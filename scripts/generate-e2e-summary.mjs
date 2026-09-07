import fs from 'node:fs';
import path from 'node:path';

function stripAnsi(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
}

function formatDuration(ms) {
  if (typeof ms !== 'number' || ms < 0 || Number.isNaN(ms)) return '0s';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;
  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${(ms / 1000).toFixed(1)}s`;
}

function formatError(errorText) {
  const cleaned = stripAnsi(errorText).trim();
  if (cleaned.length > 2500) {
    return `${cleaned.slice(0, 2500)}\n... [truncated]`;
  }
  return cleaned;
}

function extractTests(suite, parentTitles = [], inheritedFile = '') {
  const tests = [];
  const currentTitle = suite.title ? [...parentTitles, suite.title] : parentTitles;
  const currentFile = suite.file || inheritedFile;

  if (Array.isArray(suite.specs)) {
    for (const spec of suite.specs) {
      const specTitle = [...currentTitle, spec.title].filter(Boolean).join(' › ');
      const rawFile = spec.file || currentFile || '';
      const relativeFile = rawFile
        ? (path.isAbsolute(rawFile)
            ? path.relative(process.cwd(), rawFile).replace(/\\/g, '/')
            : rawFile.replace(/\\/g, '/'))
        : '';

      for (const test of spec.tests || []) {
        const results = test.results || [];
        const lastResult = results[results.length - 1];
        const errorMessages = [];

        for (const res of results) {
          if (Array.isArray(res.errors)) {
            for (const err of res.errors) {
              if (err?.message) errorMessages.push(err.message);
            }
          }
          if (res.error?.message) {
            errorMessages.push(res.error.message);
          } else if (res.error?.stack) {
            errorMessages.push(res.error.stack);
          }
        }

        tests.push({
          fullTitle: specTitle,
          specTitle: spec.title,
          file: relativeFile,
          line: spec.line,
          column: spec.column,
          projectName: test.projectName || 'default',
          status: test.status, // 'expected' | 'unexpected' | 'flaky' | 'skipped'
          retries: results.length > 1 ? results.length - 1 : 0,
          duration: results.reduce((acc, r) => acc + (r.duration || 0), 0),
          lastResultStatus: lastResult?.status,
          errors: Array.from(new Set(errorMessages)),
        });
      }
    }
  }

  if (Array.isArray(suite.suites)) {
    for (const childSuite of suite.suites) {
      tests.push(...extractTests(childSuite, currentTitle, currentFile));
    }
  }

  return tests;
}

export function generateMarkdownSummary(report) {
  const stats = report?.stats || {};
  const passed = stats.expected || 0;
  const failed = stats.unexpected || 0;
  const flaky = stats.flaky || 0;
  const skipped = stats.skipped || 0;
  const total = passed + failed + flaky + skipped;
  const duration = formatDuration(stats.duration || 0);

  const globalErrors = Array.isArray(report?.errors) ? report.errors : [];
  const allTests = [];
  if (Array.isArray(report?.suites)) {
    for (const suite of report.suites) {
      allTests.push(...extractTests(suite));
    }
  }

  const failedTests = allTests.filter((t) => t.status === 'unexpected');
  const flakyTests = allTests.filter((t) => t.status === 'flaky');

  const hasFailures = failed > 0 || globalErrors.length > 0;
  const statusBadge = hasFailures ? '❌ Failed' : flaky > 0 ? '⚠️ Passed (with flaky tests)' : '✅ Passed';
  const headerIcon = hasFailures ? '❌' : flaky > 0 ? '⚠️' : '✅';
  const headerText = hasFailures
    ? 'E2E Tests Failed'
    : flaky > 0
      ? 'E2E Tests Passed with Flakiness'
      : 'All E2E Tests Passed';

  const lines = [
    `# 🎭 Playwright E2E Test Report`,
    '',
    `### ${headerIcon} ${headerText}`,
    '',
    `| Metric | Value |`,
    `| :--- | :--- |`,
    `| **Status** | ${statusBadge} |`,
    `| **Total Tests** | ${total} |`,
    `| **Passed** | ${passed} |`,
    `| **Failed** | ${failed} |`,
    `| **Flaky** | ${flaky} |`,
    `| **Skipped** | ${skipped} |`,
    `| **Duration** | ${duration} |`,
    '',
  ];

  if (globalErrors.length > 0) {
    lines.push('### ⚠️ Global Runner Errors', '');
    for (const err of globalErrors) {
      const msg = err.message || err.stack || String(err);
      lines.push('```text', formatError(msg), '```', '');
    }
  }

  if (failedTests.length > 0) {
    lines.push(`### ❌ Failed Tests (${failedTests.length})`, '');
    failedTests.forEach((t, index) => {
      const location = t.file ? `\`${t.file}${t.line ? `:${t.line}` : ''}\`` : 'Unknown location';
      const retryInfo = t.retries > 0 ? ` (retried ${t.retries}x)` : '';
      lines.push(`#### ${index + 1}. [${t.projectName}] ${t.fullTitle}`);
      lines.push(`- **Location:** ${location}`);
      lines.push(`- **Duration:** ${formatDuration(t.duration)}${retryInfo}`);

      if (t.errors.length > 0) {
        lines.push('', '<details>', '<summary><b>Click to view error log</b></summary>', '');
        lines.push('```text');
        lines.push(formatError(t.errors.join('\n\n---\n\n')));
        lines.push('```', '</details>', '');
      } else {
        lines.push('- **Error:** No specific error message recorded.', '');
      }
    });
  }

  if (flakyTests.length > 0) {
    lines.push(`### ⚠️ Flaky Tests (${flakyTests.length})`, '');
    flakyTests.forEach((t, index) => {
      const location = t.file ? `\`${t.file}${t.line ? `:${t.line}` : ''}\`` : 'Unknown location';
      lines.push(`#### ${index + 1}. [${t.projectName}] ${t.fullTitle}`);
      lines.push(`- **Location:** ${location}`);
      lines.push(`- **Duration:** ${formatDuration(t.duration)} (passed after ${t.retries} retries)`, '');
    });
  }

  lines.push(
    '---',
    '### 📦 Artifacts & Debugging Guide',
    '- **Full HTML Report:** Download the `playwright-report` artifact from the summary page above.',
    '  ```bash',
    '  # View extracted HTML report locally',
    '  npx playwright show-report path/to/extracted-playwright-report',
    '  ```',
    '- **Traces & Screenshots:** Download the `test-results` artifact for failed test traces.',
    '  ```bash',
    '  # Inspect trace recordings',
    '  npx playwright show-trace path/to/trace.zip',
    '  ```',
    ''
  );

  return lines.join('\n');
}

function run() {
  const args = process.argv.slice(2);
  let inputPath = 'test-results/results.json';
  let outputPath = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--input' || args[i] === '-i') {
      inputPath = args[++i];
    } else if (args[i] === '--output' || args[i] === '-o') {
      outputPath = args[++i];
    }
  }

  const resolvedInput = path.resolve(process.cwd(), inputPath);
  let markdown = '';

  if (!fs.existsSync(resolvedInput)) {
    markdown = [
      '# 🎭 Playwright E2E Test Report',
      '',
      '### ⚠️ No Test Results Found',
      '',
      `The Playwright results file was not found at \`${inputPath}\`.`,
      'This usually means tests did not run or the workflow failed during setup/build.',
      '',
    ].join('\n');
  } else {
    try {
      const raw = fs.readFileSync(resolvedInput, 'utf8');
      const data = JSON.parse(raw);
      markdown = generateMarkdownSummary(data);
    } catch (err) {
      markdown = [
        '# 🎭 Playwright E2E Test Report',
        '',
        '### ❌ Failed to Parse Test Results',
        '',
        `Error parsing \`${inputPath}\`:`,
        '```text',
        err.message || String(err),
        '```',
        '',
      ].join('\n');
    }
  }

  if (outputPath) {
    fs.mkdirSync(path.dirname(path.resolve(process.cwd(), outputPath)), { recursive: true });
    fs.writeFileSync(path.resolve(process.cwd(), outputPath), markdown, 'utf8');
    console.log(`Summary written to ${outputPath}`);
  }

  if (process.env.GITHUB_STEP_SUMMARY) {
    try {
      fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, markdown + '\n', 'utf8');
      console.log('Summary successfully appended to $GITHUB_STEP_SUMMARY');
    } catch (err) {
      console.error('Failed to append to GITHUB_STEP_SUMMARY:', err.message);
    }
  }

  if (!outputPath && !process.env.GITHUB_STEP_SUMMARY) {
    console.log(markdown);
  }
}

// Run if called directly
const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1'));
if (isMain || process.argv[1]?.endsWith('generate-e2e-summary.mjs')) {
  run();
}

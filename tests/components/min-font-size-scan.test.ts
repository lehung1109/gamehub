import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

function getAllSourceFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== "node_modules" && file !== ".next") {
        getAllSourceFiles(fullPath, fileList);
      }
    } else if (/\.(tsx|ts|jsx|js|css)$/.test(file)) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

describe("Automated Static Codebase Scan for Sub-16px Typography", () => {
  const srcDir = path.resolve(process.cwd(), "src");
  const allFiles = getAllSourceFiles(srcDir);

  it("ensures no source file contains arbitrary sub-16px classes (e.g. text-[10px] to text-[15px])", () => {
    const sub16pxRegex = /text-\[(1[0-5]|[1-9])px\]/;
    const violations: { file: string; match: string }[] = [];

    for (const filePath of allFiles) {
      const content = fs.readFileSync(filePath, "utf-8");
      const match = content.match(sub16pxRegex);
      if (match) {
        violations.push({
          file: path.relative(process.cwd(), filePath),
          match: match[0],
        });
      }
    }

    expect(violations).toEqual([]);
  });

  it("ensures no source file contains sub-0.8rem (sub-16px based on rem) arbitrary font sizes (e.g. text-[0.75rem])", () => {
    const subRemRegex = /text-\[0\.[0-7][0-9]*rem\]/;
    const violations: { file: string; match: string }[] = [];

    for (const filePath of allFiles) {
      const content = fs.readFileSync(filePath, "utf-8");
      const match = content.match(subRemRegex);
      if (match) {
        violations.push({
          file: path.relative(process.cwd(), filePath),
          match: match[0],
        });
      }
    }

    expect(violations).toEqual([]);
  });
});

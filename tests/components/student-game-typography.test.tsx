import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("Student & Game Typography Normalization", () => {
  it("ensures StudentProfileBadge does not use sub-16px arbitrary classes", () => {
    const filePath = path.resolve(process.cwd(), "src/components/StudentProfileBadge.tsx");
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).not.toMatch(/text-\[10px\]/);
    expect(content).not.toMatch(/text-\[11px\]/);
  });

  it("ensures StudentBadge does not use sub-16px arbitrary classes", () => {
    const filePath = path.resolve(process.cwd(), "src/components/student/StudentBadge.tsx");
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).not.toMatch(/text-\[10px\]/);
    expect(content).not.toMatch(/text-\[11px\]/);
  });

  it("ensures TenseLessonContainer does not use sub-16px arbitrary classes", () => {
    const filePath = path.resolve(process.cwd(), "src/components/tenses/TenseLessonContainer.tsx");
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).not.toMatch(/text-\[10px\]/);
    expect(content).not.toMatch(/text-\[11px\]/);
  });

  it("ensures QuickRulesTab does not use sub-16px arbitrary classes", () => {
    const filePath = path.resolve(process.cwd(), "src/components/tenses/QuickRulesTab.tsx");
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).not.toMatch(/text-\[10px\]/);
    expect(content).not.toMatch(/text-\[11px\]/);
  });

  it("ensures Numbers & Colors game does not use sub-16px arbitrary classes", () => {
    const filePath = path.resolve(process.cwd(), "src/app/games/numbers-colors/page.tsx");
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).not.toMatch(/text-\[10px\]/);
  });
});

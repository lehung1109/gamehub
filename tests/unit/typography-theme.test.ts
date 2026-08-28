import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("Typography Theme Configuration (globals.css)", () => {
  const globalsCssPath = path.resolve(process.cwd(), "src/app/globals.css");
  const cssContent = fs.readFileSync(globalsCssPath, "utf-8");

  it("defines minimum 16px (1rem) for --text-xs in @theme inline", () => {
    expect(cssContent).toMatch(/--text-xs:\s*1rem/);
    expect(cssContent).toMatch(/--text-xs--line-height:\s*1\.5rem/);
  });

  it("defines minimum 16px (1rem) for --text-sm in @theme inline", () => {
    expect(cssContent).toMatch(/--text-sm:\s*1rem/);
    expect(cssContent).toMatch(/--text-sm--line-height:\s*1\.5rem/);
  });

  it("defines minimum 16px (1rem) for --text-base in @theme inline", () => {
    expect(cssContent).toMatch(/--text-base:\s*1rem/);
    expect(cssContent).toMatch(/--text-base--line-height:\s*1\.5rem/);
  });

  it("sets html root font-size to 16px in @layer base", () => {
    expect(cssContent).toMatch(/html\s*\{[^}]*font-size:\s*16px;/);
  });

  it("sets body font-size to 1rem and line-height to 1.5rem in @layer base", () => {
    expect(cssContent).toMatch(/body\s*\{[^}]*font-size:\s*1rem;[^}]*line-height:\s*1\.5rem;/);
  });
});

import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("Admin Dashboard & Forms Typography Verification", () => {
  it("ensures Admin layout and dashboard do not contain sub-16px arbitrary classes", () => {
    const adminLayoutPath = path.resolve(process.cwd(), "src/app/admin/layout.tsx");
    const adminDashboardPath = path.resolve(process.cwd(), "src/app/admin/dashboard/page.tsx");
    
    const layoutContent = fs.readFileSync(adminLayoutPath, "utf-8");
    const dashboardContent = fs.readFileSync(adminDashboardPath, "utf-8");

    expect(layoutContent).not.toMatch(/text-\[(1[0-5]|[0-9])px\]/);
    expect(dashboardContent).not.toMatch(/text-\[(1[0-5]|[0-9])px\]/);
  });

  it("ensures config forms do not contain sub-16px arbitrary classes", () => {
    const configDir = path.resolve(process.cwd(), "src/components/config");
    const files = fs.readdirSync(configDir);

    for (const file of files) {
      if (file.endsWith(".tsx")) {
        const content = fs.readFileSync(path.join(configDir, file), "utf-8");
        expect(content).not.toMatch(/text-\[(1[0-5]|[0-9])px\]/);
      }
    }
  });

  it("ensures dashboard components do not contain sub-16px arbitrary classes", () => {
    const dashboardDir = path.resolve(process.cwd(), "src/components/dashboard");
    const files = fs.readdirSync(dashboardDir);

    for (const file of files) {
      if (file.endsWith(".tsx")) {
        const content = fs.readFileSync(path.join(dashboardDir, file), "utf-8");
        expect(content).not.toMatch(/text-\[(1[0-5]|[0-9])px\]/);
      }
    }
  });
});

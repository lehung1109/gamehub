import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Button, buttonVariants } from "@/components/ui/button";
import { Toggle, toggleVariants } from "@/components/ui/toggle";
import { Badge, badgeVariants } from "@/components/ui/badge";

describe("Shared UI Components Typography & Sizing", () => {
  describe("Button component", () => {
    it("applies text-sm and minimum 32px height (h-8) for sm size", () => {
      const smClasses = buttonVariants({ size: "sm" });
      expect(smClasses).toContain("text-sm");
      expect(smClasses).not.toContain("text-[0.8rem]");
      expect(smClasses).toContain("h-8");
    });

    it("renders Button with sm size properly", () => {
      render(<Button size="sm">Click Me</Button>);
      const btn = screen.getByRole("button", { name: "Click Me" });
      expect(btn.className).toContain("text-sm");
      expect(btn.className).toContain("h-8");
    });
  });

  describe("Toggle component", () => {
    it("applies text-sm and h-8 for sm size", () => {
      const smClasses = toggleVariants({ size: "sm" });
      expect(smClasses).toContain("text-sm");
      expect(smClasses).not.toContain("text-[0.8rem]");
      expect(smClasses).toContain("h-8");
    });

    it("renders Toggle with sm size properly", () => {
      render(<Toggle size="sm">Toggle Me</Toggle>);
      const toggle = screen.getByRole("button", { name: "Toggle Me" });
      expect(toggle.className).toContain("text-sm");
      expect(toggle.className).toContain("h-8");
    });
  });

  describe("Badge component", () => {
    it("applies text-xs (16px) and does not constrain height to h-5", () => {
      const badgeClasses = badgeVariants();
      expect(badgeClasses).toContain("text-xs");
      expect(badgeClasses).not.toMatch(/\bh-5\b/);
    });

    it("renders Badge component properly", () => {
      render(<Badge>Status Badge</Badge>);
      expect(screen.getByText("Status Badge")).toBeInTheDocument();
    });
  });
});

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { TabSwitcher } from "@/components/game/TabSwitcher";

describe("TabSwitcher Component (src/components/game/TabSwitcher.tsx)", () => {
  const tabs = [
    { id: "numbers", label: "Số đếm (1-20)", emoji: "🔢" },
    { id: "colors", label: "Màu sắc (Colors)", emoji: "🎨" },
  ];

  it("renders all tabs with their labels and emojis", () => {
    render(
      <TabSwitcher
        tabs={tabs}
        activeTab="numbers"
        onTabChange={() => {}}
      />
    );

    expect(screen.getByRole("tab", { name: /Số đếm/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Màu sắc/i })).toBeInTheDocument();
  });

  it("calls onTabChange when a tab is clicked", () => {
    const handleTabChange = vi.fn();
    render(
      <TabSwitcher
        tabs={tabs}
        activeTab="numbers"
        onTabChange={handleTabChange}
      />
    );

    const colorsTab = screen.getByRole("tab", { name: /Màu sắc/i });
    fireEvent.click(colorsTab);

    expect(handleTabChange).toHaveBeenCalledWith("colors");
  });

  it("marks the active tab as selected with correct state", () => {
    render(
      <TabSwitcher
        tabs={tabs}
        activeTab="colors"
        onTabChange={() => {}}
      />
    );

    const colorsTab = screen.getByRole("tab", { name: /Màu sắc/i });
    expect(colorsTab).toHaveAttribute("data-active");
    expect(colorsTab).toHaveAttribute("aria-selected", "true");
  });
});

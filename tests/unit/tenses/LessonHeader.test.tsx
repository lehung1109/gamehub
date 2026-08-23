import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { LessonHeader } from "@/components/tenses/LessonHeader";
import { TenseMetadata } from "@/types/tenses";

const mockTense: TenseMetadata = {
  id: "present-simple",
  slug: "present-simple",
  name: "Present Simple",
  vietnameseName: "Thì Hiện Tại Đơn",
  group: "present",
  status: "active",
  level: "A1-A2 (Beginner)",
  badge: "Cốt lõi cho người đi làm",
  description: "Diễn tả thói quen, sự thật hiển nhiên, lịch trình và quy trình công việc hằng ngày.",
  estimatedMinutes: 10,
  challengeCount: 20,
};

describe("LessonHeader component", () => {
  it("renders breadcrumbs with links to Home and 12-Tenses Hub", () => {
    render(<LessonHeader tenseMetadata={mockTense} />);

    const homeLink = screen.getByRole("link", { name: /trang chủ/i });
    expect(homeLink).toHaveAttribute("href", "/");

    const hubLink = screen.getByRole("link", { name: /12 thì/i });
    expect(hubLink).toHaveAttribute("href", "/tenses");

    const matches = screen.getAllByText("Thì Hiện Tại Đơn");
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it("renders titles, level badge, and audio capability indicator", () => {
    render(<LessonHeader tenseMetadata={mockTense} />);

    expect(screen.getByRole("heading", { level: 1, name: /thì hiện tại đơn/i })).toBeInTheDocument();
    expect(screen.getByText("Present Simple")).toBeInTheDocument();
    expect(screen.getByText("A1-A2 (Beginner)")).toBeInTheDocument();
    expect(screen.getByText(/phát âm chuẩn bản xứ/i)).toBeInTheDocument();
  });

  it("renders progress indicator when stage info is provided", () => {
    render(
      <LessonHeader
        tenseMetadata={mockTense}
        activeTab="practice"
        currentStage="conjugation"
        completedStagesCount={1}
        totalStages={3}
      />
    );

    expect(screen.getByText(/chặng 1\/3/i)).toBeInTheDocument();
  });
});

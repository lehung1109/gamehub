import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { TenseCard } from "@/components/tenses/TenseCard";
import { TenseHubMap } from "@/components/tenses/TenseHubMap";
import { TenseMetadata } from "@/types/tenses";
import { saveStageProgress, resetProgress } from "@/lib/tenses/storage";

const mockActiveTense: TenseMetadata = {
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

const mockComingSoonTense: TenseMetadata = {
  id: "past-simple",
  slug: "past-simple",
  name: "Past Simple",
  vietnameseName: "Thì Quá Khứ Đơn",
  group: "past",
  status: "coming_soon",
  level: "A1-A2 (Beginner)",
  description: "Báo cáo sự việc, dự án hoặc cuộc họp đã kết thúc hoàn toàn trong quá khứ.",
  estimatedMinutes: 10,
  challengeCount: 20,
};

const mockTensesList: TenseMetadata[] = [
  mockActiveTense,
  {
    id: "present-continuous",
    slug: "present-continuous",
    name: "Present Continuous",
    vietnameseName: "Thì Hiện Tại Tiếp Diễn",
    group: "present",
    status: "coming_soon",
    level: "A1-A2 (Beginner)",
    description: "Diễn tả hành động đang diễn ra tại thời điểm nói hoặc kế hoạch công việc.",
    estimatedMinutes: 12,
    challengeCount: 20,
  },
  mockComingSoonTense,
  {
    id: "future-simple",
    slug: "future-simple",
    name: "Future Simple",
    vietnameseName: "Thì Tương Lai Đơn",
    group: "future",
    status: "coming_soon",
    level: "A1-A2 (Beginner)",
    description: "Đưa ra quyết định tức thì hoặc dự đoán kế hoạch tương lai.",
    estimatedMinutes: 10,
    challengeCount: 20,
  },
];

describe("TenseCard component", () => {
  it("renders active tense card with interactive link and metadata", () => {
    render(<TenseCard tense={mockActiveTense} />);

    expect(screen.getByText("Thì Hiện Tại Đơn")).toBeInTheDocument();
    expect(screen.getByText("Present Simple")).toBeInTheDocument();
    expect(screen.getByText("A1-A2 (Beginner)")).toBeInTheDocument();
    expect(screen.getByText("Cốt lõi cho người đi làm")).toBeInTheDocument();
    expect(screen.getByText(/10 phút/i)).toBeInTheDocument();
    expect(screen.getByText(/20 thử thách/i)).toBeInTheDocument();

    const link = screen.getByRole("link", { name: /thì hiện tại đơn/i });
    expect(link).toHaveAttribute("href", "/tenses/present-simple");
  });

  it("renders coming soon tense card with disabled status and no active navigation", () => {
    const { container } = render(<TenseCard tense={mockComingSoonTense} />);

    expect(screen.getByText("Thì Quá Khứ Đơn")).toBeInTheDocument();
    expect(screen.getByText("Past Simple")).toBeInTheDocument();
    expect(screen.getByText(/sắp ra mắt/i)).toBeInTheDocument();

    const link = screen.queryByRole("link", { name: /thì quá khứ đơn/i });
    expect(link).toBeNull();

    expect(container.firstChild).toHaveAttribute("aria-disabled", "true");
  });
});

describe("TenseHubMap component", () => {
  beforeEach(() => {
    resetProgress("present-simple");
    window.localStorage.clear();
  });

  it("groups tenses into Present, Past, and Future sections", () => {
    render(<TenseHubMap tenses={mockTensesList} />);

    expect(screen.getByRole("heading", { level: 2, name: /hiện tại|present/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: /quá khứ|past/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: /tương lai|future/i })).toBeInTheDocument();

    expect(screen.getByText("Thì Hiện Tại Đơn")).toBeInTheDocument();
    expect(screen.getByText("Thì Hiện Tại Tiếp Diễn")).toBeInTheDocument();
    expect(screen.getByText("Thì Quá Khứ Đơn")).toBeInTheDocument();
    expect(screen.getByText("Thì Tương Lai Đơn")).toBeInTheDocument();
  });

  it("displays back button linking to home /", () => {
    render(<TenseHubMap tenses={mockTensesList} />);

    const backButton = screen.getByRole("link", { name: /về trang chủ/i });
    expect(backButton).toHaveAttribute("href", "/");
  });

  it("hydrates and displays progress badge from localStorage", () => {
    saveStageProgress("present-simple", "conjugation", 8, 8);
    saveStageProgress("present-simple", "errorHunting", 6, 6);
    saveStageProgress("present-simple", "sentenceBuilding", 6, 6);

    render(<TenseHubMap tenses={mockTensesList} />);

    expect(screen.getByText(/100% chính xác/i)).toBeInTheDocument();
    expect(screen.getByText(/đã hoàn thành 1\/12 thì/i)).toBeInTheDocument();
  });

  it("renders tense groups with a maximum of 4 columns on desktop and no 5/6 column classes", () => {
    const { container } = render(<TenseHubMap tenses={mockTensesList} />);

    const presentSection = container.querySelector('section[aria-labelledby="group-heading-present"]');
    expect(presentSection).toBeInTheDocument();

    const gridContainer = presentSection?.querySelector(".grid");
    expect(gridContainer).toBeInTheDocument();

    // Verify responsive grid classes
    expect(gridContainer?.className).toContain("grid-cols-1");
    expect(gridContainer?.className).toContain("sm:grid-cols-2");
    expect(gridContainer?.className).toContain("lg:grid-cols-4");

    // Verify xl:grid-cols-5 and 2xl:grid-cols-6 are NOT present
    expect(gridContainer?.className).not.toContain("xl:grid-cols-5");
    expect(gridContainer?.className).not.toContain("2xl:grid-cols-6");
  });
});

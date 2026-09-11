import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { PartsOfSpeechLessonContainer } from "@/components/parts-of-speech/PartsOfSpeechLessonContainer";
import nounData from "@/data/parts-of-speech/noun.json";
import { PartsOfSpeechModuleData } from "@/types/parts-of-speech";

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/parts-of-speech/noun",
}));

// Mock parts-of-speech-storage
const mockSaveStageProgress = vi.fn();
const mockGetProgress = vi.fn().mockReturnValue(null);
vi.mock("@/lib/parts-of-speech-storage", () => ({
  saveStageProgress: (...args: unknown[]) => mockSaveStageProgress(...args),
  getProgress: (...args: unknown[]) => mockGetProgress(...args),
}));

// Mock use-game-tracking
let mockIsTracking = false;
const mockSubmitSession = vi.fn().mockResolvedValue(true);
vi.mock("@/hooks/use-game-tracking", () => ({
  useGameTracking: vi.fn((opts) => ({
    isTracking: mockIsTracking,
    submitSession: mockSubmitSession,
    options: opts,
  })),
}));

// Mock StudentProfileBadge
vi.mock("@/components/StudentProfileBadge", () => ({
  StudentProfileBadge: () => <div data-testid="student-profile-badge">StudentProfileBadge</div>,
}));

// Mock child stages as simple buttons triggering onComplete(3, 4)
vi.mock("@/components/parts-of-speech/stages/WordFamilyStage", () => ({
  WordFamilyStage: ({ onComplete }: { onComplete: (score: number, total: number) => void }) => (
    <button onClick={() => onComplete(3, 4)}>Complete Word Family</button>
  ),
}));

vi.mock("@/components/parts-of-speech/stages/FillInBlankStage", () => ({
  FillInBlankStage: ({ onComplete }: { onComplete: (score: number, total: number) => void }) => (
    <button onClick={() => onComplete(3, 4)}>Complete Fill In Blank</button>
  ),
}));

vi.mock("@/components/parts-of-speech/stages/ErrorHuntingStage", () => ({
  ErrorHuntingStage: ({ onComplete }: { onComplete: (score: number, total: number) => void }) => (
    <button onClick={() => onComplete(3, 4)}>Complete Error Hunting</button>
  ),
}));

const mockLessonData = nounData as unknown as PartsOfSpeechModuleData;

describe("PartsOfSpeechLessonContainer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsTracking = false;
  });

  it("renders header with StudentProfileBadge, lesson title, and tabs", () => {
    render(<PartsOfSpeechLessonContainer lessonData={mockLessonData} />);

    expect(screen.getByTestId("student-profile-badge")).toBeInTheDocument();
    expect(screen.getByText(/Danh từ \(Noun\)/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /quy tắc cốt lõi/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /luyện tập chặng/i })).toBeInTheDocument();
  });

  it("switches between 'rules' and 'practice' tabs", () => {
    render(<PartsOfSpeechLessonContainer lessonData={mockLessonData} />);

    const practiceTab = screen.getByRole("button", { name: /luyện tập chặng/i });
    const rulesTab = screen.getByRole("button", { name: /quy tắc cốt lõi/i });

    // Initially in rules tab - quick rules content should be shown
    expect(screen.getByText(/Đuôi Danh Từ Phổ Biến/i)).toBeInTheDocument();

    // Click practice tab
    fireEvent.click(practiceTab);
    expect(screen.getByText(/Chặng 1: Nhận diện họ từ/i)).toBeInTheDocument();

    // Click rules tab
    fireEvent.click(rulesTab);
    expect(screen.getByText(/Đuôi Danh Từ Phổ Biến/i)).toBeInTheDocument();
  });

  it("starting a stage and completing it calls saveStageProgress with (metadata.id, stage, score, total)", async () => {
    render(<PartsOfSpeechLessonContainer lessonData={mockLessonData} />);

    // Switch to practice tab
    fireEvent.click(screen.getByRole("button", { name: /luyện tập chặng/i }));

    // Start stage 1 (WordFamily)
    const startButtons = screen.getAllByRole("button", { name: /bắt đầu chặng/i });
    fireEvent.click(startButtons[0]);

    // Stage component should now be mounted with mock complete button
    const completeButton = screen.getByRole("button", { name: /complete word family/i });
    expect(completeButton).toBeInTheDocument();

    // Complete the stage
    await act(async () => {
      fireEvent.click(completeButton);
    });

    expect(mockSaveStageProgress).toHaveBeenCalledWith("noun", "wordFamily", 3, 4);
    // Should return to stage list (tabs visible again)
    expect(screen.getByRole("button", { name: /luyện tập chặng/i })).toBeInTheDocument();
  });

  it("when isTracking is true, completing a stage also calls submitSession with { score: 3, totalQuestions: 4, topic: 'noun-wordFamily', gameType: 'parts-of-speech' }", async () => {
    mockIsTracking = true;
    render(<PartsOfSpeechLessonContainer lessonData={mockLessonData} />);

    // Switch to practice tab
    fireEvent.click(screen.getByRole("button", { name: /luyện tập chặng/i }));

    // Start stage 1
    const startButtons = screen.getAllByRole("button", { name: /bắt đầu chặng/i });
    fireEvent.click(startButtons[0]);

    // Complete stage
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /complete word family/i }));
    });

    expect(mockSaveStageProgress).toHaveBeenCalledWith("noun", "wordFamily", 3, 4);
    expect(mockSubmitSession).toHaveBeenCalledWith({
      score: 3,
      totalQuestions: 4,
      topic: "noun-wordFamily",
      gameType: "parts-of-speech",
    });
  });

  it("when isTracking is false, completing a stage only calls saveStageProgress and does NOT call submitSession", async () => {
    mockIsTracking = false;
    render(<PartsOfSpeechLessonContainer lessonData={mockLessonData} />);

    // Switch to practice tab
    fireEvent.click(screen.getByRole("button", { name: /luyện tập chặng/i }));

    // Start stage 1
    const startButtons = screen.getAllByRole("button", { name: /bắt đầu chặng/i });
    fireEvent.click(startButtons[0]);

    // Complete stage
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /complete word family/i }));
    });

    expect(mockSaveStageProgress).toHaveBeenCalledWith("noun", "wordFamily", 3, 4);
    expect(mockSubmitSession).not.toHaveBeenCalled();
  });
});

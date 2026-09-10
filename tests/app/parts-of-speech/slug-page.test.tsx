import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import PartsOfSpeechLessonPage, { generateStaticParams } from "@/app/parts-of-speech/[slug]/page";
import * as navigation from "next/navigation";

vi.mock("next/navigation", () => ({
  notFound: vi.fn(),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  })),
  usePathname: vi.fn(() => "/parts-of-speech/noun"),
}));

describe("PartsOfSpeechLessonPage (src/app/parts-of-speech/[slug]/page.tsx)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("only returns active lessons in generateStaticParams", async () => {
    const params = await generateStaticParams();
    expect(params).toEqual([{ slug: "noun" }]);
    expect(params).not.toEqual(expect.arrayContaining([{ slug: "verb" }]));
  });

  it("renders lesson container when valid slug 'noun' is requested", async () => {
    const PageComponent = await PartsOfSpeechLessonPage({
      params: Promise.resolve({ slug: "noun" }),
    });

    render(PageComponent);

    expect(
      screen.getAllByText(/Noun/i).length
    ).toBeGreaterThan(0);
  });

  it("calls notFound when non-existent or inactive slug is requested", async () => {
    await PartsOfSpeechLessonPage({
      params: Promise.resolve({ slug: "verb" }),
    });

    expect(navigation.notFound).toHaveBeenCalled();
  });
});

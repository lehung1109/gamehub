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
    expect(params).toEqual([
      { slug: "noun" },
      { slug: "verb" },
      { slug: "adjective" },
      { slug: "adverb" },
      { slug: "mixed" },
    ]);
  });

  const activeLessons = [
    { slug: "noun", name: "Noun", vietnameseName: "Danh từ" },
    { slug: "verb", name: "Verb", vietnameseName: "Động từ" },
    { slug: "adjective", name: "Adjective", vietnameseName: "Tính từ" },
    { slug: "adverb", name: "Adverb", vietnameseName: "Trạng từ" },
    { slug: "mixed", name: "Mixed", vietnameseName: "Tổng hợp" },
  ];

  it.each(activeLessons)(
    "renders lesson container when valid slug '$slug' is requested",
    async ({ slug, name, vietnameseName }) => {
      const PageComponent = await PartsOfSpeechLessonPage({
        params: Promise.resolve({ slug }),
      });

      render(PageComponent);

      expect(screen.getAllByText(new RegExp(name, "i")).length).toBeGreaterThan(0);
      expect(screen.getAllByText(new RegExp(vietnameseName, "i")).length).toBeGreaterThan(0);
    }
  );

  it.each(["preposition", "unknown-slug"])(
    "calls notFound when non-existent or inactive slug '%s' is requested",
    async (invalidSlug) => {
      await PartsOfSpeechLessonPage({
        params: Promise.resolve({ slug: invalidSlug }),
      });

      expect(navigation.notFound).toHaveBeenCalled();
    }
  );
});


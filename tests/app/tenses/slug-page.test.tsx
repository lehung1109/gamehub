import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import TenseLessonPage, { generateStaticParams } from "@/app/tenses/[slug]/page";
import * as navigation from "next/navigation";

vi.mock("next/navigation", () => ({
  notFound: vi.fn(),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  })),
  usePathname: vi.fn(() => "/tenses/present-simple"),
}));

describe("TenseLessonPage (src/app/tenses/[slug]/page.tsx)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns static params containing present-simple", async () => {
    const params = await generateStaticParams();
    expect(params).toEqual(
      expect.arrayContaining([{ slug: "present-simple" }])
    );
  });

  it("renders lesson container when valid slug is requested", async () => {
    const PageComponent = await TenseLessonPage({
      params: Promise.resolve({ slug: "present-simple" }),
    });

    render(PageComponent);

    expect(
      screen.getByRole("heading", { level: 1, name: /thì hiện tại đơn/i })
    ).toBeInTheDocument();
  });

  it("calls notFound when non-existent or inactive slug is requested", async () => {
    await TenseLessonPage({
      params: Promise.resolve({ slug: "unknown-tense" }),
    });

    expect(navigation.notFound).toHaveBeenCalled();
  });
});

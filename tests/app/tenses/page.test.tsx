import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import TensesHubPage from "@/app/tenses/page";

describe("TensesHubPage (src/app/tenses/page.tsx)", () => {
  it("renders the 12-Tenses Hub page with heading and map", () => {
    render(<TensesHubPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: /bản đồ 12 thì tiếng anh/i })
    ).toBeInTheDocument();

    expect(screen.getByText("Thì Hiện Tại Đơn")).toBeInTheDocument();
  });
});

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import NotFound from "@/app/not-found";

describe("NotFound component", () => {
  it("renders 404 message and return button", () => {
    render(<NotFound />);
    expect(screen.getByText(/404/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /trang chủ/i })).toBeInTheDocument();
  });
});

import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BalloonStage } from "@/components/game/hangman/BalloonStage";

describe("BalloonStage Component", () => {
  it("renders 6 balloons initially and accessible region", () => {
    render(<BalloonStage mistakesCount={0} maxMistakes={6} wordStatus="playing" />);
    expect(screen.getByRole("region", { name: /khu vực khinh khí cầu/i })).toBeInTheDocument();
    expect(screen.getAllByTestId("balloon-item")).toHaveLength(6);
    expect(screen.getByText("6/6")).toBeInTheDocument();
    expect(screen.getByText("Đang bay lơ lửng...")).toBeInTheDocument();
    expect(screen.getByText("🧑‍🚀")).toBeInTheDocument();
  });

  it("shows remaining balloons when mistakesCount is 2", () => {
    render(<BalloonStage mistakesCount={2} maxMistakes={6} wordStatus="playing" />);
    const balloons = screen.getAllByTestId("balloon-item");
    expect(balloons).toHaveLength(6);

    const active = balloons.filter((b) => !b.classList.contains("opacity-0"));
    const popped = balloons.filter((b) => b.classList.contains("opacity-0"));

    expect(active).toHaveLength(4);
    expect(popped).toHaveLength(2);
    expect(screen.getByText("4/6")).toBeInTheDocument();
  });

  it("handles all balloons popped when mistakesCount reaches maxMistakes", () => {
    render(<BalloonStage mistakesCount={6} maxMistakes={6} wordStatus="lost" />);
    const balloons = screen.getAllByTestId("balloon-item");
    const active = balloons.filter((b) => !b.classList.contains("opacity-0"));
    expect(active).toHaveLength(0);
    expect(screen.getByText("0/6")).toBeInTheDocument();
  });

  it("displays win badge and safe explorer state when wordStatus is won", () => {
    render(<BalloonStage mistakesCount={1} maxMistakes={6} wordStatus="won" />);
    expect(screen.getByText("🎉 THẮNG RỒI!")).toBeInTheDocument();
    expect(screen.getByText("Nhà thám hiểm an toàn!")).toBeInTheDocument();
    expect(screen.getByText("🧑‍🚀")).toBeInTheDocument();
  });

  it("displays lost badge and parachute state when wordStatus is lost", () => {
    render(<BalloonStage mistakesCount={6} maxMistakes={6} wordStatus="lost" />);
    expect(screen.getByText("🪂 HẠ CÁNH AN TOÀN!")).toBeInTheDocument();
    expect(screen.getByText("Đã bung dù cứu hộ!")).toBeInTheDocument();
    expect(screen.getByText("🪂")).toBeInTheDocument();
  });
});

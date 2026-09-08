import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BattleArena } from "@/components/game/vocab-defense/BattleArena";
import { TurnTimerBar } from "@/components/game/vocab-defense/TurnTimerBar";
import { STAGE_MONSTERS } from "@/hooks/useBattleEngine";

describe("BattleArena Component", () => {
  it("renders hero stats and monster card correctly", () => {
    render(
      <BattleArena
        heroHp={85}
        maxHeroHp={100}
        heroEnergy={50}
        heroShield={20}
        potionsLeft={1}
        currentMonster={STAGE_MONSTERS[0]}
        currentMonsterHp={30}
        combatFeedback={null}
        onConsumePotion={vi.fn()}
      />
    );

    expect(screen.getByText("Word Knight")).toBeInTheDocument();
    expect(screen.getByText("85 / 100")).toBeInTheDocument();
    expect(screen.getByText("Forest Slime")).toBeInTheDocument();
    expect(screen.getByText("30 / 50")).toBeInTheDocument();
    expect(screen.getByText("+20 Shield")).toBeInTheDocument();
  });

  it("displays combat feedback text when active", () => {
    render(
      <BattleArena
        heroHp={85}
        maxHeroHp={100}
        heroEnergy={50}
        heroShield={0}
        potionsLeft={1}
        currentMonster={STAGE_MONSTERS[0]}
        currentMonsterHp={30}
        combatFeedback={{ text: "CORRECT! -40 DMG", isCorrect: true }}
        onConsumePotion={vi.fn()}
      />
    );

    expect(screen.getByText("CORRECT! -40 DMG")).toBeInTheDocument();
  });

  it("handles potion consumption click when hero HP is below max", () => {
    const onConsumePotion = vi.fn();
    render(
      <BattleArena
        heroHp={60}
        maxHeroHp={100}
        heroEnergy={50}
        heroShield={0}
        potionsLeft={1}
        currentMonster={STAGE_MONSTERS[0]}
        currentMonsterHp={50}
        combatFeedback={null}
        onConsumePotion={onConsumePotion}
      />
    );

    const potionBtn = screen.getByRole("button", { name: /Dùng Potion Hồi Máu/i });
    expect(potionBtn).not.toBeDisabled();
    fireEvent.click(potionBtn);
    expect(onConsumePotion).toHaveBeenCalledTimes(1);
  });

  it("disables potion button when no potions left or HP full", () => {
    const { rerender } = render(
      <BattleArena
        heroHp={100}
        maxHeroHp={100}
        heroEnergy={50}
        heroShield={0}
        potionsLeft={1}
        currentMonster={STAGE_MONSTERS[0]}
        currentMonsterHp={50}
        combatFeedback={null}
        onConsumePotion={vi.fn()}
      />
    );

    let potionBtn = screen.getByRole("button", { name: /Dùng Potion Hồi Máu/i });
    expect(potionBtn).toBeDisabled();

    rerender(
      <BattleArena
        heroHp={80}
        maxHeroHp={100}
        heroEnergy={50}
        heroShield={0}
        potionsLeft={0}
        currentMonster={STAGE_MONSTERS[0]}
        currentMonsterHp={50}
        combatFeedback={null}
        onConsumePotion={vi.fn()}
      />
    );

    potionBtn = screen.getByRole("button", { name: /Dùng Potion Hồi Máu/i });
    expect(potionBtn).toBeDisabled();
  });

  it("shows enraged tag on monster when HP < 30%", () => {
    render(
      <BattleArena
        heroHp={100}
        maxHeroHp={100}
        heroEnergy={0}
        heroShield={0}
        potionsLeft={0}
        currentMonster={STAGE_MONSTERS[0]}
        currentMonsterHp={10} // 10 < 50 * 0.3 (15)
        combatFeedback={null}
        onConsumePotion={vi.fn()}
      />
    );

    expect(screen.getByText("ENRAGED")).toBeInTheDocument();
  });
});

describe("TurnTimerBar Component", () => {
  it("renders countdown seconds", () => {
    render(<TurnTimerBar timer={14} maxTimer={20} />);
    expect(screen.getByText("14s")).toBeInTheDocument();
  });
});

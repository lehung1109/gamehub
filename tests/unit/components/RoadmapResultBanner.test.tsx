import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { RoadmapResultBanner } from '@/components/roadmap/RoadmapResultBanner';

describe('RoadmapResultBanner', () => {
  it('displays earned stars and unlock message when passed', () => {
    render(<RoadmapResultBanner stars={2} isNewUnlock={true} nextNodeTitle="Đếm số 1-10" />);
    expect(screen.getByText(/Đã mở khóa chặng tiếp theo!/i)).toBeDefined();
    expect(screen.getByText(/Đếm số 1-10/i)).toBeDefined();
  });

  it('displays retry encourage message when failed with 0 stars', () => {
    render(<RoadmapResultBanner stars={0} isNewUnlock={false} />);
    expect(screen.getByText(/Cần đạt tối thiểu 60% để vượt qua chặng này/i)).toBeDefined();
  });

  it('renders celebratory state and confetti container on 3 stars', () => {
    render(<RoadmapResultBanner stars={3} isNewUnlock={true} nextNodeTitle="Thử thách tiếp theo" />);
    expect(screen.getByTestId('confetti-container')).toBeDefined();
    expect(screen.getByText(/Xuất sắc! Đạt 3 sao tuyệt đối/i)).toBeDefined();
  });

  it('triggers onReplay callback when Chơi lại button is clicked', () => {
    const handleReplay = vi.fn();
    render(<RoadmapResultBanner stars={1} isNewUnlock={false} onReplay={handleReplay} />);
    const replayBtn = screen.getByRole('button', { name: /Chơi lại/i });
    fireEvent.click(replayBtn);
    expect(handleReplay).toHaveBeenCalledTimes(1);
  });

  it('triggers onBackToRoadmap callback when Về bản đồ lộ trình button is clicked', () => {
    const handleBack = vi.fn();
    render(<RoadmapResultBanner stars={2} isNewUnlock={true} onBackToRoadmap={handleBack} />);
    const backBtn = screen.getByRole('button', { name: /Về bản đồ lộ trình/i });
    fireEvent.click(backBtn);
    expect(handleBack).toHaveBeenCalledTimes(1);
  });

  it('displays already completed message when passed with stars >= 1 but isNewUnlock is false', () => {
    render(<RoadmapResultBanner stars={2} isNewUnlock={false} />);
    expect(screen.queryByText(/Đã mở khóa chặng tiếp theo!/i)).toBeNull();
    expect(screen.getByText(/Hoàn thành chặng học!/i)).toBeDefined();
  });
});

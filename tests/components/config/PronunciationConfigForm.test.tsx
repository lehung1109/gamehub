import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PronunciationConfigForm } from '@/components/config/PronunciationConfigForm';
import { PronunciationSettings } from '@/types/config';

describe('PronunciationConfigForm', () => {
  const defaultSettings: PronunciationSettings = {
    topics: ['minimal-pairs', 'workplace-words'],
    passThreshold: 70,
    wordLimit: 10,
  };

  it('renders topic options, pass threshold and word limit inputs', () => {
    const onChange = vi.fn();
    render(
      <PronunciationConfigForm
        settings={defaultSettings}
        onChange={onChange}
      />
    );

    expect(screen.getByText(/chủ đề luyện nói/i)).toBeInTheDocument();
    expect(screen.getByText(/cặp âm dễ nhầm lẫn/i)).toBeInTheDocument();
    expect(screen.getByText(/từ vựng công sở/i)).toBeInTheDocument();
    expect(screen.getByText(/điểm đạt tối thiểu/i)).toBeInTheDocument();
    expect(screen.getByText(/số lượng câu hỏi/i)).toBeInTheDocument();
  });

  it('toggles topics when checkbox is clicked', () => {
    const onChange = vi.fn();
    render(
      <PronunciationConfigForm
        settings={defaultSettings}
        onChange={onChange}
      />
    );

    const standupCheckbox = screen.getByLabelText(/câu giao tiếp standup/i);
    fireEvent.click(standupCheckbox);
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({
      topics: expect.arrayContaining(['minimal-pairs', 'workplace-words', 'standup-phrases']),
    }));
  });

  it('updates passThreshold when changed', () => {
    const onChange = vi.fn();
    render(
      <PronunciationConfigForm
        settings={defaultSettings}
        onChange={onChange}
      />
    );

    const thresholdInput = screen.getByDisplayValue('70');
    fireEvent.change(thresholdInput, { target: { value: '80' } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({
      passThreshold: 80,
    }));
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { ClassRoadmapOverview } from '@/components/class/ClassRoadmapOverview';
import * as roadmapActions from '@/app/actions/roadmap';

describe('ClassRoadmapOverview Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders world progress percentages and summary stats', () => {
    const mockOverview = {
      totalStudents: 20,
      worldProgress: [
        { worldId: 'world-1', titleVi: 'Khám phá mầm non', completionRate: 85, averageStars: 2.4 },
        { worldId: 'world-2', titleVi: 'Xây dựng nền tảng', completionRate: 40, averageStars: 1.8 },
      ],
      bottleneckNodes: [{ nodeId: 'w1-n8', titleVi: 'Đánh vần nâng cao', failRate: 35 }],
      studentsProgress: [],
    };

    render(<ClassRoadmapOverview overview={mockOverview} />);
    expect(screen.getByText('Khám phá mầm non')).toBeDefined();
    expect(screen.getByText('85%')).toBeDefined();
    expect(screen.getByText('Xây dựng nền tảng')).toBeDefined();
    expect(screen.getByText('40%')).toBeDefined();
    expect(screen.getByText(/20/)).toBeDefined();
  });

  it('displays bottleneck nodes', () => {
    const mockOverview = {
      totalStudents: 15,
      worldProgress: [
        { worldId: 'world-1', titleVi: 'Khám phá mầm non', completionRate: 70, averageStars: 2.1 },
      ],
      bottleneckNodes: [
        { nodeId: 'w1-n8', titleVi: 'Đánh vần nâng cao', failRate: 35 },
        { nodeId: 'w2-n3', titleVi: 'Từ ghép phức tạp', failRate: 50 },
      ],
      studentsProgress: [],
    };

    render(<ClassRoadmapOverview overview={mockOverview} />);
    expect(screen.getByText(/Đánh vần nâng cao/)).toBeDefined();
    expect(screen.getByText(/35%/)).toBeDefined();
    expect(screen.getByText(/Từ ghép phức tạp/)).toBeDefined();
    expect(screen.getByText(/50%/)).toBeDefined();
  });

  it('displays student progress table', () => {
    const mockOverview = {
      totalStudents: 2,
      worldProgress: [
        { worldId: 'world-1', titleVi: 'Khám phá mầm non', completionRate: 50, averageStars: 2.0 },
      ],
      bottleneckNodes: [],
      studentsProgress: [
        { studentId: 's1', studentName: 'Nguyễn Văn An', completedNodesCount: 8, totalStars: 24 },
        { studentId: 's2', studentName: 'Trần Thị Bình', completedNodesCount: 5, totalStars: 14 },
      ],
    };

    render(<ClassRoadmapOverview overview={mockOverview} />);
    expect(screen.getByText('Nguyễn Văn An')).toBeDefined();
    expect(screen.getByText('24')).toBeDefined();
    expect(screen.getByText('Trần Thị Bình')).toBeDefined();
    expect(screen.getByText('14')).toBeDefined();
  });

  it('fetches roadmap overview using classId if overview prop is omitted', async () => {
    const spy = vi.spyOn(roadmapActions, 'getClassRoadmapOverviewAction').mockResolvedValue({
      success: true,
      data: {
        totalStudents: 12,
        worldProgress: [
          { worldId: 'world-1', titleVi: 'Thế giới số học', completionRate: 60, averageStars: 2.2 },
        ],
        bottleneckNodes: [
          { nodeId: 'w1-n5', titleVi: 'Phép cộng trừ cơ bản', failRate: 25 },
        ],
        studentsProgress: [
          { studentId: 's3', studentName: 'Lê Hoàng Cường', completedNodesCount: 6, totalStars: 16 },
        ],
      },
    });

    render(<ClassRoadmapOverview classId="class-123" />);

    expect(screen.getByText(/Đang tải dữ liệu lộ trình/i)).toBeDefined();

    await waitFor(() => {
      expect(screen.getByText('Thế giới số học')).toBeDefined();
      expect(screen.getAllByText('60%').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/Phép cộng trừ cơ bản/)).toBeDefined();
      expect(screen.getByText('Lê Hoàng Cường')).toBeDefined();
    });

    expect(spy).toHaveBeenCalledWith('class-123');
  });

  it('displays error state if fetch fails', async () => {
    vi.spyOn(roadmapActions, 'getClassRoadmapOverviewAction').mockResolvedValue({
      success: false,
      error: 'Không thể kết nối đến máy chủ',
    });

    render(<ClassRoadmapOverview classId="class-error" />);

    await waitFor(() => {
      expect(screen.getByText(/Không thể kết nối đến máy chủ/i)).toBeDefined();
    });
  });
});

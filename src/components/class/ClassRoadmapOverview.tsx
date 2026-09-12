'use client';

import React, { useState, useEffect } from 'react';
import type { ClassRoadmapOverview as ClassRoadmapOverviewType } from '@/types/roadmap';
import { getClassRoadmapOverviewAction } from '@/app/actions/roadmap';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Compass,
  Star,
  Award,
  AlertTriangle,
  Users,
  CheckCircle2,
  Loader2,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';

export interface ClassRoadmapOverviewProps {
  overview?: ClassRoadmapOverviewType;
  classId?: string;
}

export function ClassRoadmapOverview({ overview, classId }: ClassRoadmapOverviewProps) {
  const [fetchedData, setFetchedData] = useState<ClassRoadmapOverviewType | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (overview || !classId) {
      return;
    }

    let isSubscribed = true;

    getClassRoadmapOverviewAction(classId)
      .then((res) => {
        if (!isSubscribed) return;
        if (res.success && res.data) {
          setFetchedData(res.data);
        } else {
          setErrorMessage(res.error || 'Không thể tải dữ liệu lộ trình lớp học');
        }
      })
      .catch((err) => {
        if (!isSubscribed) return;
        setErrorMessage(
          err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định'
        );
      });

    return () => {
      isSubscribed = false;
    };
  }, [overview, classId]);

  const currentOverview = overview ?? fetchedData;
  const isLoading = !overview && Boolean(classId) && !fetchedData && !errorMessage;

  if (isLoading) {
    return (
      <Card className="border-slate-200 shadow-xs bg-white">
        <CardContent className="py-12 text-center text-slate-500">
          <Loader2 className="size-6 animate-spin mx-auto mb-2 text-indigo-600" />
          <p className="text-sm font-medium">Đang tải dữ liệu lộ trình học tập...</p>
        </CardContent>
      </Card>
    );
  }

  if (errorMessage) {
    return (
      <Card className="border-red-200 bg-red-50/50 shadow-xs">
        <CardContent className="py-8 flex items-center justify-center gap-3 text-red-700">
          <AlertCircle className="size-5 shrink-0" />
          <p className="text-sm font-medium">{errorMessage}</p>
        </CardContent>
      </Card>
    );
  }

  if (!currentOverview) {
    return null;
  }

  const { totalStudents, worldProgress = [], bottleneckNodes = [], studentsProgress = [] } = currentOverview;

  const avgCompletionRate =
    worldProgress.length > 0
      ? Math.round(
          worldProgress.reduce((sum, w) => sum + (w.completionRate || 0), 0) /
            worldProgress.length
        )
      : 0;

  const overallAvgStars =
    worldProgress.length > 0
      ? Number(
          (
            worldProgress.reduce((sum, w) => sum + (w.averageStars || 0), 0) /
            worldProgress.length
          ).toFixed(1)
        )
      : 0;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Compass className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">
                Tiến độ Lộ trình & Chặng học
              </h2>
              <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 font-bold text-xs">
                {worldProgress.length} Thế giới
              </Badge>
            </div>
            <p className="text-xs text-slate-500">
              Phân tích tỷ lệ hoàn thành lộ trình học tập, chặng khó và sao đạt được
            </p>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <Card className="border-slate-200 shadow-xs bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Tổng số học sinh
            </CardTitle>
            <div className="size-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900">{totalStudents}</div>
            <p className="text-xs text-slate-500 mt-1">Đang theo học lộ trình</p>
          </CardContent>
        </Card>

        {/* Avg Completion Rate */}
        <Card className="border-slate-200 shadow-xs bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Tiến độ toàn khóa
            </CardTitle>
            <div className="size-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-indigo-700">{avgCompletionRate}%</div>
            <p className="text-xs text-slate-500 mt-1">Tỷ lệ hoàn thành trung bình</p>
          </CardContent>
        </Card>

        {/* Avg Stars */}
        <Card className="border-slate-200 shadow-xs bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Điểm sao trung bình
            </CardTitle>
            <div className="size-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Star className="size-4 fill-amber-400 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900 flex items-center gap-1">
              <span>{overallAvgStars}</span>
              <span className="text-base font-medium text-amber-500">/ 3.0 ⭐</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Mỗi chặng hoàn thành</p>
          </CardContent>
        </Card>

        {/* Bottleneck count */}
        <Card className="border-slate-200 shadow-xs bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Chặng cần hỗ trợ
            </CardTitle>
            <div className="size-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-rose-600">{bottleneckNodes.length}</div>
            <p className="text-xs text-slate-500 mt-1">Chặng có tỷ lệ chưa đạt cao</p>
          </CardContent>
        </Card>
      </div>

      {/* World Progress Cards */}
      <Card className="border-slate-200 shadow-xs bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Compass className="size-5 text-indigo-600" />
            Tiến độ theo Thế giới
          </CardTitle>
          <CardDescription>
            Tỷ lệ học sinh hoàn thành các chặng và điểm sao trung bình của từng thế giới
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {worldProgress.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">
              Chưa có dữ liệu thế giới nào
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {worldProgress.map((world) => (
                <div
                  key={world.worldId}
                  className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-800 text-sm">
                      {world.titleVi}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Star className="size-3 fill-amber-400 text-amber-500" />
                        {world.averageStars}
                      </span>
                      <span className="font-extrabold text-indigo-700 text-sm">
                        {world.completionRate}%
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        world.completionRate >= 80
                          ? 'bg-emerald-500'
                          : world.completionRate >= 50
                          ? 'bg-indigo-600'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${Math.max(0, Math.min(100, world.completionRate))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bottlenecks Alert Section */}
      <Card className="border-slate-200 shadow-xs bg-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="size-5 text-amber-500" />
            Các chặng học cần chú ý (Điểm nghẽn)
          </CardTitle>
          <CardDescription>
            Danh sách các chặng học sinh gặp khó khăn hoặc có tỷ lệ chưa đạt cao
          </CardDescription>
        </CardHeader>
        <CardContent>
          {bottleneckNodes.length === 0 ? (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center gap-3">
              <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
              <p className="text-xs font-medium text-emerald-800">
                Không có điểm nghẽn học tập! Tất cả chặng học đều được học sinh hoàn thành tốt.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {bottleneckNodes.map((node) => (
                <div
                  key={node.nodeId}
                  className="p-3 rounded-lg border border-rose-100 bg-rose-50/50 flex items-center justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-900 text-xs block">
                      {node.titleVi}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      Mã: {node.nodeId}
                    </span>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-rose-100 text-rose-800 border border-rose-200 text-xs font-bold shrink-0"
                  >
                    {node.failRate}% chưa đạt
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Student Progress Matrix / Table */}
      <Card className="border-slate-200 shadow-xs bg-white">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Award className="size-5 text-indigo-600" />
                Tiến độ lộ trình học sinh ({studentsProgress.length})
              </CardTitle>
              <CardDescription>
                Chi tiết số sao tích lũy và số chặng đã hoàn thành của từng em
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {studentsProgress.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
              Chưa có dữ liệu tiến độ lộ trình của học sinh nào
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                    <th className="py-2.5 px-3">Học sinh</th>
                    <th className="py-2.5 px-3 text-center">Tổng sao đạt được</th>
                    <th className="py-2.5 px-3 text-right">Số chặng đã hoàn thành</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {studentsProgress.map((student) => (
                    <tr
                      key={student.studentId}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-800 text-sm">
                          {student.studentName}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex items-center gap-1 font-extrabold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full text-xs">
                          <Star className="size-3.5 fill-amber-400 text-amber-500" />
                          {student.totalStars}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-medium text-slate-700">
                        <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-md text-xs font-bold">
                          {student.completedNodesCount} chặng
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

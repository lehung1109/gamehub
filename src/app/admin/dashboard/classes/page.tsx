import React from 'react'
import { getClassesAction } from '@/app/actions/classes'
import { ClassList } from '@/components/class/ClassList'
import { CreateClassForm } from '@/components/class/CreateClassForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, School } from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Quản lý lớp học | GameHub Admin',
}

export default async function ClassesPage() {
  const { data: classes, error } = await getClassesAction()

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <School className="size-8 text-indigo-600" />
            Quản lý Lớp học
          </h1>
          <p className="text-slate-500 mt-1">
            Tạo và quản lý các lớp học để theo dõi kết quả chơi game của học sinh.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Create Class */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-slate-200 shadow-xs bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Tạo lớp mới</CardTitle>
              <CardDescription>
                Hệ thống sẽ tự động sinh mã lớp. Hãy gửi mã này cho học sinh.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CreateClassForm />
            </CardContent>
          </Card>
          
          <Card className="border-emerald-100 bg-emerald-50/50 shadow-xs">
            <CardHeader className="pb-2">
              <CardTitle className="text-emerald-800 text-sm flex items-center gap-2">
                <span className="size-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs">?</span>
                Cách hoạt động
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-emerald-700/90 space-y-2">
              <p>1. <strong>Tạo lớp</strong> và nhận mã lớp ngắn (VD: ABC123).</p>
              <p>2. <strong>Chia sẻ mã</strong> cho học sinh viết lên bảng hoặc gửi tin nhắn.</p>
              <p>3. <strong>Học sinh nhập mã</strong> cùng tên mình khi bắt đầu chơi game.</p>
              <p>4. <strong>Kết quả tự động lưu</strong> vào dashboard để bạn theo dõi.</p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Class List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">
              Danh sách lớp học ({classes?.length || 0})
            </h2>
          </div>

          {error ? (
            <div className="flex items-start gap-2 text-red-600 bg-red-50 p-4 rounded-lg border border-red-100">
              <AlertCircle className="size-5 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-sm">Lỗi tải danh sách lớp</h3>
                <p className="text-sm opacity-90">{error}</p>
              </div>
            </div>
          ) : null}

          <ClassList classes={classes || []} />
        </div>
      </div>
    </div>
  )
}

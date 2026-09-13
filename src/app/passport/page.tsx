// src/app/passport/page.tsx

import type { Metadata } from 'next'
import { SAMPLE_STUDENT_PASSPORT } from '@/data/passport/sample-passport'
import { PassportHub } from '@/components/passport/PassportHub'

export const metadata: Metadata = {
  title: 'Hộ Chiếu Năng Lực & Lễ Tốt Nghiệp Trực Tuyến | GameHub Tiếng Anh',
  description:
    'Xem hồ sơ năng lực tiếng Anh, bộ sưu tập dấu ấn học tập, hồ sơ giọng nói và chứng chỉ tốt nghiệp khóa học.',
}

export default function PassportPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <PassportHub initialPassport={SAMPLE_STUDENT_PASSPORT} />
    </main>
  )
}

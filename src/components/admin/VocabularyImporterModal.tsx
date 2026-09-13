'use client'

import React, { useState, useTransition } from 'react'
import {
  Upload,
  FileText,
  Trash2,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  X,
  Loader2,
  FileSpreadsheet,
} from 'lucide-react'
import type { CefrLevel, PartOfSpeech } from '@/types/word-bank'
import type {
  ValidatedImportRow,
  ImportValidationSummary,
} from '@/types/importer'
import {
  parseQuizletText,
  parseCsvOrTsv,
  validateImportRows,
  formatRowsForWordBank,
} from '@/lib/vocabulary-importer'
import { bulkCreateWordBankWordsAction } from '@/app/actions/word-bank'

export interface VocabularyImporterModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  existingWords?: Set<string>
}

const CEFR_OPTIONS: CefrLevel[] = ['Pre-A1', 'A1', 'A2', 'B1', 'B2']
const POS_OPTIONS: { value: PartOfSpeech; label: string }[] = [
  { value: 'noun', label: 'Danh từ (noun)' },
  { value: 'verb', label: 'Động từ (verb)' },
  { value: 'adjective', label: 'Tính từ (adj)' },
  { value: 'adverb', label: 'Phó từ (adv)' },
  { value: 'phrase', label: 'Cụm từ (phrase)' },
]

export function VocabularyImporterModal({
  isOpen,
  onClose,
  onSuccess,
  existingWords,
}: VocabularyImporterModalProps) {
  const [activeTab, setActiveTab] = useState<'paste' | 'file'>('paste')
  const [rawText, setRawText] = useState('')
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null)
  const [delimiter, setDelimiter] = useState<string>('auto')
  const [defaultCefr, setDefaultCefr] = useState<CefrLevel>('A1')
  const [defaultTopic, setDefaultTopic] = useState('general')
  const [parsedRows, setParsedRows] = useState<ValidatedImportRow[]>([])
  const [summary, setSummary] = useState<ImportValidationSummary | null>(null)
  const [showExamples, setShowExamples] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isSubmitting, startTransition] = useTransition()

  if (!isOpen) return null

  function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedFileName(file.name)
    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      setRawText(text)
    }
    reader.readAsText(file)
  }

  function handleParseData() {
    setErrorMessage(null)
    setSuccessMessage(null)

    if (!rawText || !rawText.trim()) {
      setErrorMessage('Vui lòng dán nội dung hoặc chọn tệp tin cần nhập')
      return
    }

    try {
      let customDelim: string | undefined
      if (delimiter === 'tab') customDelim = '\t'
      else if (delimiter === 'comma') customDelim = ','
      else if (delimiter === 'dash') customDelim = '-'
      else if (delimiter === 'colon') customDelim = ':'

      const isCsv = selectedFileName?.endsWith('.csv') || selectedFileName?.endsWith('.tsv')
      const rawRows = isCsv
        ? parseCsvOrTsv(rawText)
        : parseQuizletText(rawText, customDelim)

      if (rawRows.length === 0) {
        setErrorMessage('Không nhận diện được từ vựng nào. Vui lòng kiểm tra lại định dạng.')
        return
      }

      const result = validateImportRows(
        rawRows,
        { defaultCefrLevel: defaultCefr, defaultTopic },
        existingWords
      )


      setParsedRows(result.rows)
      setSummary(result.summary)
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Lỗi khi phân tích dữ liệu')
    }
  }

  function toggleMasterCheckbox(checked: boolean) {
    setParsedRows((prev) =>
      prev.map((r) => ({
        ...r,
        isSelected: checked,
      }))
    )
  }

  function toggleRowCheckbox(id: string) {
    setParsedRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isSelected: !r.isSelected } : r))
    )
  }

  function updateRowField(id: string, field: keyof ValidatedImportRow, value: unknown) {
    setParsedRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    )
  }

  function deleteRow(id: string) {
    setParsedRows((prev) => {
      const next = prev.filter((r) => r.id !== id)
      // Recalculate summary
      const validCount = next.filter((r) => r.status === 'valid').length
      const warningCount = next.filter((r) => r.status === 'warning').length
      const duplicateCount = next.filter((r) => r.status === 'duplicate').length
      const errorCount = next.filter((r) => r.status === 'error').length
      setSummary({
        total: next.length,
        validCount,
        warningCount,
        duplicateCount,
        errorCount,
      })
      return next
    })
  }

  function handleSubmit() {
    const selectedRows = parsedRows.filter((r) => r.isSelected && r.status !== 'error')
    if (selectedRows.length === 0) {
      setErrorMessage('Vui lòng chọn ít nhất 1 dòng từ vựng hợp lệ để nhập')
      return
    }

    setErrorMessage(null)
    startTransition(async () => {
      try {
        const formattedInputs = formatRowsForWordBank(selectedRows)

        // Supabase bulk action allows max 50 items per batch
        const BATCH_SIZE = 50
        let totalCreated = 0

        for (let i = 0; i < formattedInputs.length; i += BATCH_SIZE) {
          const batch = formattedInputs.slice(i, i + BATCH_SIZE)
          const res = await bulkCreateWordBankWordsAction(batch)
          if (!res.success) {
            setErrorMessage(res.error || 'Lỗi khi thêm danh sách từ vựng vào ngân hàng')
            return
          }
          totalCreated += res.count || batch.length
        }

        setSuccessMessage(`Đã thêm thành công ${totalCreated} từ vựng vào Ngân hàng từ vựng!`)
        onSuccess?.()
        setTimeout(() => {
          onClose()
        }, 1200)
      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : 'Lỗi hệ thống khi lưu từ vựng')
      }
    })
  }

  const allSelected = parsedRows.length > 0 && parsedRows.every((r) => r.isSelected)
  const selectedCount = parsedRows.filter((r) => r.isSelected && r.status !== 'error').length

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 bg-linear-to-r from-indigo-50 to-blue-50 border-b border-slate-200">
          <div className="flex items-center gap-4">
            <div className="size-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
              <FileSpreadsheet className="size-7" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900">
                Nhập từ vựng hàng loạt
              </h2>
              <p className="text-base text-slate-600 font-medium">
                Nhập nhanh từ danh sách Quizlet, Excel, CSV hoặc văn bản tự do
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-white/80 transition-colors"
          >
            <X className="size-6" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-8 space-y-6">
          {/* Messages */}
          {errorMessage && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-base font-semibold">
              <AlertCircle className="size-6 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-base font-semibold">
              <CheckCircle2 className="size-6 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Tab Selection */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl">
              <button
                type="button"
                onClick={() => setActiveTab('paste')}
                className={`px-6 py-3 rounded-xl text-base font-bold transition-all flex items-center gap-2.5 ${
                  activeTab === 'paste'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="size-5" />
                Dán văn bản (Quizlet / Text)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('file')}
                className={`px-6 py-3 rounded-xl text-base font-bold transition-all flex items-center gap-2.5 ${
                  activeTab === 'file'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Upload className="size-5" />
                Tải tệp tin (.csv / .tsv / .txt)
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowExamples(!showExamples)}
              className="text-base font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-indigo-50 transition-colors"
            >
              <HelpCircle className="size-5" />
              {showExamples ? 'Ẩn ví dụ định dạng' : 'Xem ví dụ định dạng'}
            </button>
          </div>

          {/* Example Drawer */}
          {showExamples && (
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-base text-slate-700">
              <h4 className="font-bold text-slate-900 text-base">Định dạng hỗ trợ chuẩn:</h4>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong className="text-slate-900">Quizlet / Phím Tab:</strong> Mỗi dòng gồm từ tiếng Anh, phím Tab, nghĩa tiếng Việt (Ví dụ: <code className="bg-white px-2 py-1 rounded-md border border-slate-200 font-mono">galaxy	thiên hà</code>).
                </li>
                <li>
                  <strong className="text-slate-900">Dấu phẩy / CSV:</strong> Có thể xuất từ Excel thành file .csv (Ví dụ: <code className="bg-white px-2 py-1 rounded-md border border-slate-200 font-mono">planet,hành tinh</code>).
                </li>
                <li>
                  <strong className="text-slate-900">Dấu gạch ngang / Dấu hai chấm:</strong> Ví dụ: <code className="bg-white px-2 py-1 rounded-md border border-slate-200 font-mono">comet - sao chổi</code> hoặc <code className="bg-white px-2 py-1 rounded-md border border-slate-200 font-mono">rocket : tên lửa</code>.
                </li>
              </ul>
            </div>
          )}

          {/* Input Area */}
          {activeTab === 'paste' ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="text-base font-bold text-slate-800">
                  Nội dung sao chép:
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-base text-slate-600 font-medium">Ký tự ngăn cách:</span>
                  <select
                    value={delimiter}
                    onChange={(e) => setDelimiter(e.target.value)}
                    className="text-base font-semibold px-4 py-2 border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="auto">Tự động phát hiện</option>
                    <option value="tab">Phím Tab (\t)</option>
                    <option value="comma">Dấu phẩy (,)</option>
                    <option value="dash">Dấu gạch ngang (-)</option>
                    <option value="colon">Dấu hai chấm (:)</option>
                  </select>
                </div>
              </div>
              <textarea
                rows={6}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Dán danh sách từ vựng tại đây...&#10;Ví dụ:&#10;apple	quả táo&#10;banana	quả chuối&#10;orange	quả cam"
                className="w-full text-base font-mono p-4 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
              />
            </div>
          ) : (
            <div className="space-y-3">
              <label className="text-base font-bold text-slate-800">
                Chọn tệp tin từ máy tính:
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-3xl p-8 text-center hover:border-indigo-400 transition-colors bg-slate-50/50">
                <input
                  type="file"
                  id="vocab-file-upload"
                  accept=".csv,.tsv,.txt"
                  onChange={handleFileSelected}
                  className="hidden"
                />
                <label
                  htmlFor="vocab-file-upload"
                  className="cursor-pointer flex flex-col items-center justify-center gap-3"
                >
                  <div className="size-14 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                    <Upload className="size-7" />
                  </div>
                  <div>
                    <span className="text-base font-bold text-indigo-600 hover:text-indigo-800 underline">
                      Bấm vào đây để chọn tệp
                    </span>
                    <p className="text-base text-slate-500 mt-1 font-medium">
                      Hỗ trợ các định dạng .csv, .tsv, .txt (tối đa 50 từ mỗi lần nhập)
                    </p>
                  </div>
                  {selectedFileName && (
                    <span className="px-4 py-1.5 bg-indigo-100 text-indigo-800 font-bold rounded-xl text-base mt-2">
                      Đã chọn: {selectedFileName}
                    </span>
                  )}
                </label>
              </div>
            </div>
          )}

          {/* Options & Parse Button */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-slate-700">Trình độ mặc định:</span>
                <select
                  value={defaultCefr}
                  onChange={(e) => setDefaultCefr(e.target.value as CefrLevel)}
                  className="text-base font-semibold px-3 py-2 border border-slate-300 rounded-xl bg-white"
                >
                  {CEFR_OPTIONS.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-slate-700">Chủ đề mặc định:</span>
                <input
                  type="text"
                  value={defaultTopic}
                  onChange={(e) => setDefaultTopic(e.target.value)}
                  placeholder="Ví dụ: animals, science..."
                  className="text-base font-semibold px-3 py-2 border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleParseData}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2 text-base"
            >
              Phân tích dữ liệu
            </button>
          </div>

          {/* Preview Table */}
          {parsedRows.length > 0 && (
            <div className="space-y-4 pt-2">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-xl font-bold text-slate-900">
                  Xem trước & Chỉnh sửa ({parsedRows.length} dòng)
                </h3>
                {summary && (
                  <div className="flex flex-wrap items-center gap-2 text-base font-semibold">
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-xl">
                      {summary.validCount} hợp lệ
                    </span>
                    {summary.warningCount > 0 && (
                      <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-xl">
                        {summary.warningCount} cảnh báo
                      </span>
                    )}
                    {summary.duplicateCount > 0 && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-xl">
                        {summary.duplicateCount} trùng lặp
                      </span>
                    )}
                    {summary.errorCount > 0 && (
                      <span className="px-3 py-1 bg-rose-100 text-rose-800 rounded-xl">
                        {summary.errorCount} lỗi
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200 max-h-96">
                <table className="w-full text-left border-collapse text-base">
                  <thead className="bg-slate-100 sticky top-0 z-10 text-slate-800 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3 w-12 text-center">
                        <input
                          type="checkbox"
                          checked={allSelected}
                          onChange={(e) => toggleMasterCheckbox(e.target.checked)}
                          className="size-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </th>
                      <th className="p-3">Tiếng Anh</th>
                      <th className="p-3">Tiếng Việt</th>
                      <th className="p-3 w-28">Trình độ</th>
                      <th className="p-3 w-36">Chủ đề</th>
                      <th className="p-3 w-36">Từ loại</th>
                      <th className="p-3 w-28 text-center">Trạng thái</th>
                      <th className="p-3 w-16 text-center">Xóa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {parsedRows.map((row) => (
                      <tr
                        key={row.id}
                        className={`hover:bg-slate-50 transition-colors ${
                          !row.isSelected ? 'opacity-50' : ''
                        }`}
                      >
                        <td className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={row.isSelected}
                            onChange={() => toggleRowCheckbox(row.id)}
                            className="size-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="text"
                            value={row.english}
                            onChange={(e) => updateRowField(row.id, 'english', e.target.value)}
                            className="w-full text-base font-semibold px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="text"
                            value={row.vietnamese}
                            onChange={(e) => updateRowField(row.id, 'vietnamese', e.target.value)}
                            className="w-full text-base font-medium px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </td>
                        <td className="p-3">
                          <select
                            value={row.cefrLevel}
                            onChange={(e) => updateRowField(row.id, 'cefrLevel', e.target.value as CefrLevel)}
                            className="w-full text-base font-semibold px-2 py-1.5 border border-slate-200 rounded-lg bg-white"
                          >
                            {CEFR_OPTIONS.map((lvl) => (
                              <option key={lvl} value={lvl}>
                                {lvl}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="p-3">
                          <input
                            type="text"
                            value={row.topic}
                            onChange={(e) => updateRowField(row.id, 'topic', e.target.value)}
                            className="w-full text-base px-2 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </td>
                        <td className="p-3">
                          <select
                            value={row.partOfSpeech}
                            onChange={(e) => updateRowField(row.id, 'partOfSpeech', e.target.value as PartOfSpeech)}
                            className="w-full text-base font-medium px-2 py-1.5 border border-slate-200 rounded-lg bg-white"
                          >
                            {POS_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="p-3 text-center">
                          {row.status === 'valid' && (
                            <span className="inline-block px-3 py-1 rounded-full text-base font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Hợp lệ
                            </span>
                          )}
                          {row.status === 'warning' && (
                            <span className="inline-block px-3 py-1 rounded-full text-base font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              Cảnh báo
                            </span>
                          )}
                          {row.status === 'duplicate' && (
                            <span className="inline-block px-3 py-1 rounded-full text-base font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              Trùng lặp
                            </span>
                          )}
                          {row.status === 'error' && (
                            <span className="inline-block px-3 py-1 rounded-full text-base font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              Lỗi
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => deleteRow(row.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="size-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-8 py-5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div className="text-base text-slate-600 font-bold">
            {parsedRows.length > 0 ? (
              <span>Đã chọn: <strong className="text-indigo-600">{selectedCount}</strong> / {parsedRows.length} từ</span>
            ) : (
              <span>Chưa có dữ liệu nào được phân tích</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-base transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || selectedCount === 0}
              className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-base shadow-md transition-all flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Đang thêm vào kho từ...
                </>
              ) : (
                `Thêm vào Ngân hàng từ vựng (${selectedCount})`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

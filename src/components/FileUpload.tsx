'use client'

import { useRef } from 'react'
import { Image as ImageIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { acceptedFileTypes } from '@/utils/files'
import FilePreview from './FilePreview'

interface FileUploadProps {
  value?: File | null
  onChange: (file: File | null) => void
  disabled?: boolean
}

export default function FileUpload({
  value,
  onChange,
  disabled,
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const t = useTranslations('File')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    onChange(file)
  }

  const handleClear = () => {
    onChange(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="w-full bg-white p-6 rounded-xl border shadow-sm">
      <input
        ref={fileInputRef}
        id="file-upload"
        type="file"
        accept={acceptedFileTypes}
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled}
      />

      {value ? (
        <div className="w-full rounded-lg overflow-hidden border border-slate-200">
          <FilePreview
            file={value}
            onRemove={disabled ? undefined : handleClear}
            className="h-48 w-full bg-slate-50"
            imageClassName="object-contain"
          />
        </div>
      ) : (
        <label
          htmlFor="file-upload"
          className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-slate-50 border-slate-300 transition-colors ${
            disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-100'
          }`}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <ImageIcon className="w-8 h-8 mb-2 text-slate-400" />
            <p className="text-sm text-slate-500">{t('selectFile')}</p>
          </div>
        </label>
      )}
    </div>
  )
}

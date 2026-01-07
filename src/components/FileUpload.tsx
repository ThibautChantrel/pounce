'use client'

import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useState, useRef } from 'react'
import { X, Image as ImageIcon, FileText, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { acceptedFileTypes } from '@/utils/files'

// Définition des props attendues par le composant
interface FileUploadProps {
  onSubmit: (formData: FormData) => Promise<void>
}

export default function FileUpload({ onSubmit }: FileUploadProps) {
  const [pending, setPending] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const t = useTranslations('File')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFileName(file.name)
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file)
        setPreviewUrl(url)
      } else {
        setPreviewUrl(null)
      }
    } else {
      handleClear()
    }
  }

  const handleClear = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    setFileName(null)
    if (formRef.current) formRef.current.reset()
  }

  async function handleSubmit(formData: FormData) {
    const file = formData.get('file') as File
    // Validation locale (UI pure)
    if (!file || file.size === 0) {
      toast.error(t('noFileSelected'))
      return
    }

    setPending(true)
    try {
      await onSubmit(formData)
      handleClear()
    } catch (error) {
      console.error(error)
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="w-full max-w-sm bg-white p-6 rounded-xl shadow-lg">
      <form ref={formRef} action={handleSubmit} className="flex flex-col gap-4">
        <input
          id="file-upload"
          type="file"
          name="file"
          accept={acceptedFileTypes}
          className="hidden"
          onChange={handleFileChange}
        />

        {previewUrl ? (
          <div className="relative w-full h-48 bg-slate-100 rounded-lg overflow-hidden border">
            <Image
              src={previewUrl}
              alt="Preview"
              fill
              className="object-contain"
              unoptimized
            />
            <button
              type="button"
              onClick={handleClear}
              className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 transition z-10"
            >
              <X size={16} />
            </button>
          </div>
        ) : fileName ? (
          <div className="relative flex items-center justify-center w-full h-32 bg-slate-50 rounded-lg border border-dashed border-slate-300">
            <div className="text-center p-4">
              <FileText className="mx-auto h-8 w-8 text-slate-400 mb-2" />
              <p className="text-sm text-slate-600 font-medium truncate max-w-50">
                {fileName}
              </p>
            </div>
            <button
              type="button"
              onClick={handleClear}
              className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-500 transition"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <label
            htmlFor="file-upload"
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 border-slate-300 transition-colors"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <ImageIcon className="w-8 h-8 mb-2 text-slate-400" />
              <p className="text-sm text-slate-500">{t('selectFile')}</p>
            </div>
          </label>
        )}

        <Button
          type="submit"
          disabled={pending || !fileName}
          className="w-full"
        >
          {pending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('uploading')}
            </>
          ) : (
            t('uploadButton')
          )}
        </Button>
      </form>
    </div>
  )
}

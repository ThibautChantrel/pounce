'use client'

import { useState, useMemo, useEffect } from 'react'
import Image from 'next/image'
import { X, FileText, Map as MapIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FilePreviewProps {
  file?: File | null
  url?: string
  mimeType?: string
  fileName?: string

  onRemove?: () => void

  className?: string
  imageClassName?: string
  iconClassName?: string
}

export default function FilePreview({
  file,
  url,
  mimeType,
  fileName,
  onRemove,
  className,
  imageClassName,
  iconClassName,
}: FilePreviewProps) {
  const currentType = file?.type || mimeType || ''
  const currentName = file?.name || fileName || 'Fichier'

  const isImage = currentType.startsWith('image/')
  const isGpx = currentName.endsWith('.gpx') || currentType.includes('gpx')

  const previewSrc = useMemo(() => {
    if (file && isImage) {
      return URL.createObjectURL(file)
    } else if (url && isImage) {
      return url
    }
    return null
  }, [file, url, isImage])

  useEffect(() => {
    return () => {
      if (previewSrc && file && isImage) {
        URL.revokeObjectURL(previewSrc)
      }
    }
  }, [previewSrc, file, isImage])

  if (!file && !url) return null

  if (previewSrc && isImage) {
    return (
      <div className={cn('relative overflow-hidden', className)}>
        <Image
          src={previewSrc}
          alt={currentName}
          fill
          className={cn('object-contain', imageClassName)}
          unoptimized
        />
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 transition z-10"
          >
            <X size={16} />
          </button>
        )}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-center p-4',
        className
      )}
    >
      {isGpx ? (
        <MapIcon className={cn('w-10 h-10 mb-2 opacity-70', iconClassName)} />
      ) : (
        <FileText className={cn('w-10 h-10 mb-2 opacity-70', iconClassName)} />
      )}

      <p className="text-sm font-medium truncate max-w-full text-center px-2">
        {currentName}
      </p>

      {file?.size && (
        <p className="text-xs opacity-70 mt-1">
          {(file.size / 1024).toFixed(2)} KB
        </p>
      )}

      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-2 right-2 p-1 hover:text-red-500 transition"
        >
          <X size={16} />
        </button>
      )}
    </div>
  )
}

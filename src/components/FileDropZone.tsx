'use client'

import { useRef } from 'react'
import { Image as ImageIcon } from 'lucide-react'
import { acceptedFileTypes } from '@/utils/files'
import FilePreview from './FilePreview' // Ton composant FilePreview corrigé

interface FileDropZoneProps {
  /** Le fichier actuellement sélectionné */
  file: File | null
  /** Callback quand un fichier est choisi */
  onFileSelect: (file: File) => void
  /** Callback pour supprimer le fichier */
  onFileRemove: () => void
  /** Texte d'aide (ex: "Cliquez pour upload") */
  label?: string
}

export default function FileDropZone({
  file,
  onFileSelect,
  onFileRemove,
  label = 'Cliquez pour sélectionner un fichier',
}: FileDropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      onFileSelect(selectedFile)
    }
  }

  const handleRemove = () => {
    // 1. On informe le parent
    onFileRemove()
    // 2. On reset l'input HTML pour pouvoir ré-uploader le même fichier si besoin
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  // Si un fichier est présent, on affiche l'aperçu
  if (file) {
    return <FilePreview file={file} onRemove={handleRemove} />
  }

  // Sinon, on affiche la zone de drop/sélection
  return (
    <>
      <input
        ref={inputRef}
        id="file-dropzone"
        type="file"
        name="file"
        accept={acceptedFileTypes}
        className="hidden"
        onChange={handleInputChange}
      />
      <label
        htmlFor="file-dropzone"
        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 border-slate-300 transition-colors"
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <ImageIcon className="w-8 h-8 mb-2 text-slate-400" />
          <p className="text-sm text-slate-500">{label}</p>
        </div>
      </label>
    </>
  )
}

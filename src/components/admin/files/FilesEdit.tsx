'use client'

import { toast } from 'sonner'
import { FileData, updateFileAction } from '@/actions/file/file.admin.actions'
import { useRouter } from '@/navigation'
import { FileUpdateForm } from '@/components/FileUpdateForm'

interface FileEditClientProps {
  file: FileData
}

export function FileEditClient({ file }: FileEditClientProps) {
  const router = useRouter()

  const handleSave = async (formData: FormData) => {
    try {
      const res = await updateFileAction(file.id, formData)

      if (res.success) {
        toast.success('Fichier mis à jour avec succès')
        router.push(`/admin/files/${file.id}`)
        router.refresh()
      } else {
        toast.error(res.error || 'Erreur lors de la mise à jour')
        throw new Error(res.error)
      }
    } catch (error) {
      toast.error('Une erreur inattendue est survenue')
      throw error
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm">
      <FileUpdateForm
        initialData={file}
        onSubmit={handleSave}
        onCancel={() => router.back()}
      />
    </div>
  )
}

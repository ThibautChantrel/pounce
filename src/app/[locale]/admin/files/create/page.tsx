'use client'

import FileUpload from '@/components/FileUpload'
import { uploadFileAction } from '@/actions/file/file.admin.actions'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/navigation'

export default function CreatePage() {
  const router = useRouter()
  const t = useTranslations('File')

  // C'est cette fonction qui contient la logique métier
  const handleUploadLogic = async (formData: FormData) => {
    try {
      const result = await uploadFileAction(formData)
      toast.success(t('uploadSuccess'))
      router.push(`/admin/files/${result.id}`)
    } catch (error) {
      toast.error(t('uploadError'))
      throw error // Important pour le catch du composant enfant
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">
          Ajouter un fichier
        </h1>
        <p className="text-muted-foreground">
          Importez une image ou un fichier GPX pour vos challenges.
        </p>
      </div>

      <FileUpload onSubmit={handleUploadLogic} />
    </div>
  )
}

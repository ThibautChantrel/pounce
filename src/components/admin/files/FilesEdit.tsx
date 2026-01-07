'use client'

import { toast } from 'sonner'
import { updateFileAction } from '@/actions/file/file.admin.actions'
import { FileUpdateForm } from '@/components/FileUpdateForm'
import { useRouter } from '@/navigation'

interface FileEditClientProps {
  file: {
    id: string
    filename: string
  }
}

export function FileEditClient({ file }: FileEditClientProps) {
  const router = useRouter()

  const handleSave = async (formData: FormData) => {
    try {
      const res = await updateFileAction(file.id, formData)

      if (res.success) {
        toast.success('Fichier mis à jour avec succès')
        router.push(`/admin/files/${file.id}`)
        router.refresh() // Rafraîchit les données de la page cible
      } else {
        toast.error(res.error || 'Erreur lors de la mise à jour')
        // On throw pour que le formulaire sache qu'il y a eu une erreur (optionnel)
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
        initialData={{ filename: file.filename }}
        onSubmit={handleSave} // On passe la fonction de logique
        onCancel={() => router.back()}
      />
    </div>
  )
}

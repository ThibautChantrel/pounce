'use client'

import { z } from 'zod'
import { uploadFileAction } from '@/actions/file/file.admin.actions'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/navigation'
import { DataCreate, CreateFieldConfig } from '@/components/admin/data-create'

const createFileSchema = z.object({
  file: z
    .any()
    .refine((file) => file instanceof File, 'Un fichier est requis')
    .refine((file) => file?.size > 0, 'Le fichier ne peut pas être vide'),
})

export default function CreatePage() {
  const router = useRouter()
  const t = useTranslations('Admin.Files')

  const fields: CreateFieldConfig<z.infer<typeof createFileSchema>>[] = [
    {
      name: 'file',
      label: 'Fichier à uploader',
      type: 'file',
      description: t('acceptedFormat'),
    },
  ]

  const handleCreate = async (values: z.infer<typeof createFileSchema>) => {
    try {
      const formData = new FormData()

      if (values.file) {
        formData.append('file', values.file)
      }

      const result = await uploadFileAction(formData)

      toast.success(t('uploadSuccess'))
      router.push(`/admin/files/${result.id}`)
    } catch (error) {
      console.error(error)
      toast.error(t('uploadError'))
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6 w-full max-w-lg mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">{t('selectFile')}</h1>
      </div>

      <div className="w-full">
        <DataCreate
          schema={createFileSchema}
          fields={fields}
          defaultValues={{
            file: null,
          }}
          onSubmit={handleCreate}
          submitLabel={t('uploadButton')}
          onCancel={() => router.back()}
        />
      </div>
    </div>
  )
}

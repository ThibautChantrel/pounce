'use client'

import { z } from 'zod'
import { toast } from 'sonner'
import { DataCreate, CreateFieldConfig } from '@/components/admin/data-create'
import { useRouter } from '@/navigation'
import { useTranslations } from 'next-intl'
import { createPoiTypeAction } from '@/actions/poi-type/poi-type.admin.action'

export default function CreatePoiTypePage() {
  const router = useRouter()
  const t = useTranslations('Admin.PoiTypes')
  const tGlobal = useTranslations('Admin.Global')
  const tAction = useTranslations('Admin.Actions')

  const createPoiTypeSchema = z.object({
    value: z.string().min(2, { message: t('validation.valueTooShort') }),
    description: z.string().optional(),
  })

  type CreatePoiTypeSchemaType = z.output<typeof createPoiTypeSchema>

  const fields: CreateFieldConfig<CreatePoiTypeSchemaType>[] = [
    {
      name: 'value',
      label: t('value'),
      type: 'text',
      placeholder: 'Ex: Métro, Monument, Restaurant...',
    },
    {
      name: 'description',
      label: tGlobal('description'),
      type: 'textarea',
      placeholder: 'Description du type...',
    },
  ]

  const handleSubmit = async (values: CreatePoiTypeSchemaType) => {
    const result = await createPoiTypeAction(values)

    if (!result.success) {
      toast.error(result.error || t('createError'))
      throw new Error(result.error)
    }

    toast.success(t('createSuccess'))
    router.push(`/admin/poi-types/${result.data}`)
  }

  return (
    <div className="container max-w-2xl mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          {t('createTitle')}
        </h1>
        <p className="text-muted-foreground">{t('createSubtitle')}</p>
      </div>

      <DataCreate
        schema={createPoiTypeSchema}
        fields={fields}
        defaultValues={{ value: '', description: '' }}
        onSubmit={handleSubmit}
        submitLabel={tAction('create')}
        onCancel={() => router.back()}
      />
    </div>
  )
}

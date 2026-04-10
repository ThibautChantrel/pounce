'use client'

import { z } from 'zod'
import { toast } from 'sonner'
import { DataCreate, CreateFieldConfig } from '@/components/admin/data-create'
import { useRouter } from '@/navigation'
import { useTranslations } from 'next-intl'
import { createCategoryAction } from '@/actions/category/category.admin.action'

export default function CreateCategoryPage() {
  const router = useRouter()
  const t = useTranslations('Admin.Categories')
  const tGlobal = useTranslations('Admin.Global')
  const tAction = useTranslations('Admin.Actions')

  const createCategorySchema = z.object({
    value: z.string().min(2, { message: t('validation.valueTooShort') }),
    description: z.string().optional(),
  })

  type CreateCategorySchemaType = z.output<typeof createCategorySchema>

  const fields: CreateFieldConfig<CreateCategorySchemaType>[] = [
    {
      name: 'value',
      label: t('value'),
      type: 'text',
      placeholder: 'Ex: Trail, Running, Vélo...',
      className: 'col-span-1 md:col-span-2',
    },
    {
      name: 'description',
      label: tGlobal('description'),
      type: 'textarea',
      placeholder: 'Description de la catégorie...',
      className: 'col-span-1 md:col-span-2',
    },
  ]

  const handleSubmit = async (values: CreateCategorySchemaType) => {
    try {
      const result = await createCategoryAction({
        ...values,
        description: values.description || undefined,
      })

      if (!result.success) {
        toast.error(result.error || t('createError'))
        return
      }

      toast.success(t('createSuccess'))
      router.push(`/admin/categories/${result.data}`)
    } catch (error) {
      console.error(error)
      toast.error(tAction('unknownError'))
    }
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
        schema={createCategorySchema}
        fields={fields}
        defaultValues={{
          value: '',
          description: '',
        }}
        onSubmit={handleSubmit}
        submitLabel={tAction('save')}
        onCancel={() => router.back()}
      />
    </div>
  )
}

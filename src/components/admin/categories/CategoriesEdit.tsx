'use client'

import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { DataUpdate, UpdateFieldConfig } from '@/components/admin/data-update'
import { useTranslations } from 'next-intl'
import { updateCategoryAction } from '@/actions/category/category.admin.action'
import { CategoryWithRelations } from '@/server/modules/category/category.types'

interface CategoriesEditProps {
  category: CategoryWithRelations
}

export default function CategoriesEdit({ category }: CategoriesEditProps) {
  const router = useRouter()
  const t = useTranslations('Admin.Categories')
  const tGlobal = useTranslations('Admin.Global')
  const tAction = useTranslations('Admin.Actions')

  const categoryFormSchema = z.object({
    value: z.string().min(2, { message: t('validation.valueTooShort') }),
    description: z.string().optional().nullable(),
  })

  type CategoryFormSchema = typeof categoryFormSchema
  type CategoryFormInput = z.input<CategoryFormSchema>
  type CategoryFormOutput = z.output<CategoryFormSchema>

  const fields: UpdateFieldConfig<CategoryFormInput>[] = [
    {
      name: 'value',
      label: t('value'),
      type: 'text',
      placeholder: 'Ex: Trail, Running, Vélo...',
    },
    {
      name: 'description',
      label: tGlobal('description'),
      type: 'textarea',
      placeholder: 'Description de la catégorie...',
    },
  ]

  const handleSubmit = async (values: CategoryFormOutput) => {
    try {
      const result = await updateCategoryAction({
        id: category.id,
        ...values,
      })

      if (!result.success) {
        toast.error(result.error || t('updateError'))
      } else {
        toast.success(t('updateSuccess'))
        router.refresh()
        router.back()
      }
    } catch (error) {
      console.error(error)
      toast.error(tGlobal('Actions.unknownError'))
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          {t('updateTitle')}
        </h1>
        <p className="text-muted-foreground mt-2">
          {t('updateSubtitle', { value: category.value })}
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <DataUpdate
          schema={categoryFormSchema}
          fields={fields}
          defaultValues={{
            value: category.value,
            description: category.description || '',
          }}
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
          submitLabel={tAction('update')}
        />
      </div>
    </div>
  )
}

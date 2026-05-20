'use client'

import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { DataUpdate, UpdateFieldConfig } from '@/components/admin/data-update'
import { useTranslations } from 'next-intl'
import { updatePoiTypeAction } from '@/actions/poi-type/poi-type.admin.action'
import { PoiTypeWithRelations } from '@/server/modules/poi-type/poi-type.types'

interface PoiTypesEditProps {
  poiType: PoiTypeWithRelations
}

export default function PoiTypesEdit({ poiType }: PoiTypesEditProps) {
  const router = useRouter()
  const t = useTranslations('Admin.PoiTypes')
  const tGlobal = useTranslations('Admin.Global')
  const tAction = useTranslations('Admin.Actions')

  const poiTypeFormSchema = z.object({
    value: z.string().min(2, { message: t('validation.valueTooShort') }),
    description: z.string().optional().nullable(),
  })

  type PoiTypeFormSchema = typeof poiTypeFormSchema
  type PoiTypeFormInput = z.input<PoiTypeFormSchema>
  type PoiTypeFormOutput = z.output<PoiTypeFormSchema>

  const fields: UpdateFieldConfig<PoiTypeFormInput>[] = [
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

  const handleSubmit = async (values: PoiTypeFormOutput) => {
    try {
      const result = await updatePoiTypeAction({ id: poiType.id, ...values })

      if (!result.success) {
        toast.error(result.error || t('updateError'))
      } else {
        toast.success(t('updateSuccess'))
        router.refresh()
        router.back()
      }
    } catch (error) {
      console.error(error)
      toast.error(tAction('deleteError'))
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          {t('updateTitle')}
        </h1>
        <p className="text-muted-foreground mt-2">
          {t('updateSubtitle', { value: poiType.value })}
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <DataUpdate
          schema={poiTypeFormSchema}
          fields={fields}
          defaultValues={{
            value: poiType.value,
            description: poiType.description || '',
          }}
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
          submitLabel={tAction('update')}
        />
      </div>
    </div>
  )
}

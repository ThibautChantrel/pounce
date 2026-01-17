'use client'

import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { DataUpdate, UpdateFieldConfig } from '@/components/admin/data-update'
import { useTranslations } from 'next-intl'
import { PoiType } from '@prisma/client'
import { getPoiTypeOptions } from '@/utils/pois' // L'utilitaire créé précédemment
import { updatePoiAction } from '@/actions/poi/poi.admin.actions'
import { Poi } from '@/actions/poi/poi.admin.type'

interface PoiEditPageProps {
  poi: Poi
}

export default function PoiEdit({ poi }: PoiEditPageProps) {
  const router = useRouter()
  const t = useTranslations('Admin')

  const poiFormSchema = z.object({
    name: z.string().min(2, { message: t('Pois.validation.nameTooShort') }),
    type: z.nativeEnum(PoiType, {
      message: t('Pois.validation.typeInvalid'),
    }),
    description: z.string().optional(),
    latitude: z
      .number({ message: t('Pois.validation.invalidNumber') })
      .min(-90, { message: t('Pois.validation.invalidNumber') })
      .max(90, { message: t('Pois.validation.invalidNumber') }),

    longitude: z
      .number({ message: t('Pois.validation.invalidNumber') })
      .min(-180, { message: t('Pois.validation.invalidNumber') })
      .max(180, { message: t('Pois.validation.invalidNumber') }),
  })

  type PoiFormSchema = typeof poiFormSchema
  type PoiFormOutput = z.output<PoiFormSchema>

  const fields: UpdateFieldConfig<PoiFormOutput>[] = [
    {
      name: 'name',
      label: t('Pois.name'),
      type: 'text',
      placeholder: 'Ex: Tour Eiffel',
    },
    {
      name: 'type',
      label: t('Pois.type'),
      type: 'select',
      options: getPoiTypeOptions(),
    },
    {
      name: 'latitude',
      label: t('Pois.latitude'),
      type: 'number',
    },
    {
      name: 'longitude',
      label: t('Pois.longitude'),
      type: 'number',
    },
    {
      name: 'description',
      label: t('Pois.description'),
      type: 'textarea',
      placeholder: 'Description du lieu...',
    },
  ]

  const handleSubmit = async (values: PoiFormOutput) => {
    try {
      const result = await updatePoiAction({
        id: poi.id,
        ...values,
        description: values.description!,
      })

      if (!result.success) {
        toast.error(result.error || t('Actions.updateError'))
      } else {
        toast.success(
          t('Pois.updateSuccess', {
            defaultMessage: 'Lieu mis à jour avec succès',
          })
        )
        router.refresh()
        router.back()
      }
    } catch (error) {
      console.error(error)
      toast.error(t('Actions.unknownError'))
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          {t('Pois.updateTitle', { defaultMessage: 'Modifier le lieu' })}
        </h1>
        <p className="text-muted-foreground mt-2">
          {t('Pois.updateSubtitle', {
            name: poi.name,
            defaultMessage: `Modification de : ${poi.name}`,
          })}
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <DataUpdate
          schema={poiFormSchema}
          fields={fields}
          defaultValues={{
            name: poi.name,
            type: poi.type,
            description: poi.description!,
            latitude: poi.latitude,
            longitude: poi.longitude,
          }}
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
          submitLabel={t('Actions.update')}
        />
      </div>
    </div>
  )
}

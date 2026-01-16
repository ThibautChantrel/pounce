'use client'

import { z } from 'zod'
import { toast } from 'sonner'
import { DataCreate, CreateFieldConfig } from '@/components/admin/data-create'
import { useRouter } from '@/navigation'
import { useTranslations } from 'next-intl'
import { PoiType } from '@prisma/client' // Import de l'enum Prisma
import { createPoiAction } from '@/actions/poi/poi.admin.actions'
import { PoiTypeOptions } from '@/utils/pois'

export default function CreatePoiPage() {
  const router = useRouter()
  const t = useTranslations('Admin')

  const createPoiSchema = z.object({
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

  type CreatePoiSchemaType = z.output<typeof createPoiSchema>

  const fields: CreateFieldConfig<CreatePoiSchemaType>[] = [
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
      placeholder: 'Sélectionner un type',
      options: PoiTypeOptions,
    },
    {
      name: 'latitude',
      label: t('Pois.latitude'),
      type: 'number',
      placeholder: '48.8584',
    },
    {
      name: 'longitude',
      label: t('Pois.longitude'),
      type: 'number',
      placeholder: '2.2945',
    },
    {
      name: 'description',
      label: t('Pois.description'),
      type: 'textarea', // Assure-toi que ton DataCreate gère 'textarea', sinon mets 'text'
      placeholder: 'Description du lieu...',
    },
  ]

  const handleSubmit = async (values: CreatePoiSchemaType) => {
    // Note: createPoiAction attend un objet JSON typé, pas un FormData
    // (selon le code que je t'ai donné précédemment)
    const result = await createPoiAction({
      ...values,
    })

    if (!result.success) {
      toast.error(result.error || 'Erreur lors de la création')
      throw new Error(result.error) // Pour arrêter le loader du bouton
    }

    toast.success(t('Pois.createdSuccess'))
    router.push(`/admin/pois/${result.data}`)
  }

  return (
    <div className="container max-w-2xl mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          {t('Pois.createTitle')}
        </h1>
        <p className="text-muted-foreground">{t('Pois.createSubtitle')}</p>
      </div>

      <DataCreate
        schema={createPoiSchema}
        fields={fields}
        defaultValues={{
          name: '',
          type: PoiType.OTHER,
          description: '',
          latitude: 0,
          longitude: 0,
        }}
        onSubmit={handleSubmit}
        submitLabel={t('Pois.createButton')}
        onCancel={() => router.back()}
      />
    </div>
  )
}

'use client'

import { z } from 'zod'
import { toast } from 'sonner'
import { DataCreate, CreateFieldConfig } from '@/components/admin/data-create' // Assure-toi du bon chemin d'import
import { useRouter } from '@/navigation'
import { useTranslations } from 'next-intl'
import { createTrackAction } from '@/actions/track/track.admin.action'
import { fetchFiles } from '@/actions/file/file.admin.actions'
import { fetchPois } from '@/actions/poi/poi.admin.actions'

export default function CreateTrackPage() {
  const router = useRouter()
  const t = useTranslations('Admin')
  const tGlobal = useTranslations('Admin.Global')

  const createTrackSchema = z.object({
    title: z.string().min(2, { message: t('Tracks.validation.titleTooShort') }),

    description: z.string().optional(),

    distance: z
      .number({ message: t('Tracks.validation.distanceNegative') })
      .min(0, { message: t('Tracks.validation.distanceNegative') }),

    elevationGain: z
      .number({ message: t('Tracks.validation.distanceNegative') })
      .min(0, { message: t('Tracks.validation.distanceNegative') }),

    visible: z.boolean(),

    coverId: z.string().optional().nullable(),
    bannerId: z.string().optional().nullable(),
    gpxFileId: z.string().optional().nullable(),
    poiIds: z.array(z.string()).optional(),
  })

  // On déduit le type TS à partir du schéma Zod
  type CreateTrackSchemaType = z.output<typeof createTrackSchema>

  const fetchFilesForRelation = async (params: {
    skip: number
    take: number
    search?: string
  }) => {
    const res = await fetchFiles(params)
    return {
      data: res.data.map((f) => ({ id: f.id, name: f.filename })),
      total: res.total,
    }
  }

  const fetchPoisForAssociation = async (params: {
    skip: number
    take: number
    search?: string
  }) => {
    const res = await fetchPois(params)
    return {
      data: res.data.map((f) => ({ id: f.id, name: f.name })),
      total: res.total,
    }
  }

  const fields: CreateFieldConfig<CreateTrackSchemaType>[] = [
    {
      name: 'title',
      label: tGlobal('title'), // "Titre"
      type: 'text',
      placeholder: 'Ex: Traversée de Paris',
      className: 'col-span-1 md:col-span-2', // Prend toute la largeur
    },
    {
      name: 'distance',
      label: t('Tracks.distance'), // "Distance (km)"
      type: 'number',
      placeholder: '12.5',
    },
    {
      name: 'elevationGain',
      label: t('Tracks.elevationGain'),
      type: 'number',
      placeholder: '12',
    },
    {
      name: 'visible',
      label: t('Tracks.visible'), // "Visibilité"
      type: 'boolean',
      description: 'Rendre ce parcours visible publiquement immédiatement ?',
    },
    {
      name: 'description',
      label: tGlobal('description'),
      type: 'textarea', // Déclenche le Textarea de ton DataCreate
      placeholder: 'Description du parcours...',
      className: 'col-span-1 md:col-span-2', // Prend toute la largeur
    },
    {
      name: 'coverId',
      label: t('Files.cover'),
      type: 'relation',
      relationFetch: fetchFilesForRelation,
      relationMode: 'single',
      placeholder: t('Files.placeholderCover'),
    },
    {
      name: 'bannerId',
      label: t('Files.banner'),
      type: 'relation',
      relationFetch: fetchFilesForRelation,
      relationMode: 'single',
      placeholder: t('Files.placeholderBanner'),
    },
    {
      name: 'gpxFileId',
      label: t('Files.gpxFile'),
      type: 'relation',
      relationFetch: fetchFilesForRelation,
      relationMode: 'single',
      placeholder: t('Files.placeholderGpxFile'),
    },
    {
      name: 'poiIds',
      label: t('Pois.title'),
      type: 'relation',
      relationFetch: fetchPoisForAssociation,
      relationMode: 'multiple',
      placeholder: t('Pois.choosePois'),
    },
  ]

  // 3. Soumission
  const handleSubmit = async (values: CreateTrackSchemaType) => {
    try {
      const result = await createTrackAction({
        ...values,
        description: values.description || undefined,
        coverId: values.coverId || undefined,
        bannerId: values.bannerId || undefined,
        gpxFileId: values.gpxFileId || undefined,
      })

      if (!result.success) {
        toast.error(result.error || 'Erreur lors de la création')
        return
      }

      toast.success(t('Tracks.createSuccess'))
      router.push(`/admin/tracks/${result.data}`)
    } catch (error) {
      console.error(error)
      toast.error(t('Actions.unknownError'))
    }
  }

  return (
    <div className="container max-w-2xl mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          {t('Tracks.createTitle')}
        </h1>
        <p className="text-muted-foreground">{t('Tracks.createSubtitle')}</p>
      </div>

      <DataCreate
        schema={createTrackSchema}
        fields={fields}
        defaultValues={{
          title: '',
          distance: 0,
          elevationGain: 0,
          visible: false,
          description: '',
          coverId: null,
          bannerId: null,
          gpxFileId: null,
        }}
        onSubmit={handleSubmit}
        submitLabel={t('Actions.save')}
        onCancel={() => router.back()}
      />
    </div>
  )
}

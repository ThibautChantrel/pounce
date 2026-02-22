'use client'

import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { DataUpdate, UpdateFieldConfig } from '@/components/admin/data-update'
import { useTranslations } from 'next-intl'
import { updateTrackAction } from '@/actions/track/track.admin.action'
import { fetchFiles } from '@/actions/file/file.admin.actions'
import { TrackWithRelations } from '@/server/modules/track/track.types'
import { fetchPois } from '@/actions/poi/poi.admin.actions'

interface TrackEditPageProps {
  track: TrackWithRelations
}

export default function TrackEditPage({ track }: TrackEditPageProps) {
  const router = useRouter()
  const t = useTranslations('Admin.Tracks')
  const tGlobal = useTranslations('Admin.Global')
  const tAction = useTranslations('Admin.Actions')
  const tFile = useTranslations('Admin.Files')
  const tPois = useTranslations('Admin.Pois')

  const trackFormSchema = z.object({
    title: z
      .string()
      .min(2, { message: 'Le titre doit contenir au moins 2 caractères' }),

    description: z.string().optional().nullable(),

    distance: z
      .number({ message: t('validation.distanceNegative') })
      .min(0, { message: t('validation.distanceNegative') }),

    elevationGain: z
      .number({ message: t('validation.distanceNegative') })
      .min(0, { message: t('validation.distanceNegative') }),

    visible: z.boolean(),

    coverId: z.string().optional().nullable(),
    bannerId: z.string().optional().nullable(),
    gpxFileId: z.string().optional().nullable(),
    poiIds: z.array(z.string()).optional(),
  })

  type TrackFormSchema = typeof trackFormSchema
  type TrackFormInput = z.input<TrackFormSchema>
  type TrackFormOutput = z.output<TrackFormSchema>

  const fetchFilesForAssociation = async (params: {
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

  const fields: UpdateFieldConfig<TrackFormInput>[] = [
    {
      name: 'title',
      label: tGlobal('title'),
      type: 'text',
      placeholder: 'Ex: Traversée de Paris',
    },
    {
      name: 'distance',
      label: t('distance'),
      type: 'number',
      placeholder: '12.5',
    },
    {
      name: 'elevationGain',
      label: t('elevationGain'),
      type: 'number',
      placeholder: '125',
    },
    {
      name: 'visible',
      label: t('visible'),
      type: 'boolean',
      description: 'Rendre ce parcours visible publiquement ?',
    },
    {
      name: 'description',
      label: tGlobal('description'),
      type: 'textarea',
      placeholder: 'Description du parcours...',
    },
    {
      name: 'coverId',
      label: tFile('cover'),
      type: 'relation',
      relationFetch: fetchFilesForAssociation,
      relationMode: 'single',
      relationInitialData: track.cover
        ? [{ id: track.cover.id, name: track.cover.filename }]
        : [],
      placeholder: tFile('placeholderCover'),
    },
    {
      name: 'bannerId',
      label: tFile('banner'),
      type: 'relation',
      relationFetch: fetchFilesForAssociation,
      relationMode: 'single',
      relationInitialData: track.banner
        ? [{ id: track.banner.id, name: track.banner.filename }]
        : [],
      placeholder: tFile('placeholderBanner'),
    },
    {
      name: 'gpxFileId',
      label: tFile('gpxFile'),
      type: 'relation',
      relationFetch: fetchFilesForAssociation,
      relationMode: 'single',
      relationInitialData: track.gpxFile
        ? [{ id: track.gpxFile.id, name: track.gpxFile.filename }]
        : [],
      placeholder: tFile('placeholderGpxFile'),
    },
    {
      name: 'poiIds',
      label: tPois('title'),
      type: 'relation',
      relationFetch: fetchPoisForAssociation,
      relationMode: 'multiple',
      relationInitialData: track.pois
        ? track.pois.map((p) => ({ id: p.id, name: p.name }))
        : [],
      placeholder: tPois('choosePois'),
    },
  ]

  const handleSubmit = async (values: TrackFormOutput) => {
    try {
      const result = await updateTrackAction({
        id: track.id,
        ...values,
        description: values.description!,
        coverId: values.coverId ?? undefined,
        bannerId: values.bannerId ?? undefined,
        gpxFileId: values.gpxFileId ?? undefined,
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
          {t('updateSubtitle', { title: track.title })}
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <DataUpdate
          schema={trackFormSchema}
          fields={fields}
          defaultValues={{
            title: track.title,
            distance: track.distance,
            elevationGain: track.elevationGain,
            visible: track.visible,
            description: track.description || '',
            coverId: track.coverId,
            bannerId: track.bannerId,
            gpxFileId: track.gpxFileId,
            poiIds: track.pois ? track.pois.map((p) => p.id) : [],
          }}
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
          submitLabel={tAction('update')}
        />
      </div>
    </div>
  )
}

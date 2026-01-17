'use client'

import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { DataUpdate, UpdateFieldConfig } from '@/components/admin/data-update'
import { useTranslations } from 'next-intl'
import { Track } from '@prisma/client'
import { updateTrackAction } from '@/actions/track/track.admin.action'

interface TrackEditPageProps {
  track: Track
}

export default function TrackEditPage({ track }: TrackEditPageProps) {
  const router = useRouter()
  const t = useTranslations('Admin.Tracks')
  const tGlobal = useTranslations('Admin.Global')
  const tAction = useTranslations('Admin.Actions')

  const trackFormSchema = z.object({
    title: z
      .string()
      .min(2, { message: 'Le titre doit contenir au moins 2 caractères' }),

    description: z.string().optional().nullable(),

    distance: z
      .number({ message: t('validation.distanceNegative') })
      .min(0, { message: t('validation.distanceNegative') }),

    visible: z.boolean(),

    coverId: z.string().optional().nullable(),
    bannerId: z.string().optional().nullable(),
    gpxFileId: z.string().optional().nullable(),
  })

  type TrackFormSchema = typeof trackFormSchema
  type TrackFormInput = z.input<TrackFormSchema>
  type TrackFormOutput = z.output<TrackFormSchema>

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
      name: 'visible',
      label: t('visible'),
      type: 'boolean', // Affichera un Switch
      description: 'Rendre ce parcours visible publiquement ?',
    },
    {
      name: 'description',
      label: tGlobal('description'),
      type: 'textarea',
      placeholder: 'Description du parcours...',
    },
  ]

  // 4. Gestion de la soumission
  const handleSubmit = async (values: TrackFormOutput) => {
    try {
      const result = await updateTrackAction({
        id: track.id,
        ...values,
        description: values.description!,
        // TODO : CHANGE
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
            visible: track.visible,
            description: track.description || '',
            coverId: track.coverId,
            bannerId: track.bannerId,
            gpxFileId: track.gpxFileId,
          }}
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
          submitLabel={tAction('update')}
        />
      </div>
    </div>
  )
}

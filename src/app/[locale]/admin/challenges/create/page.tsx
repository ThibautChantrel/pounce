'use client'

import { z } from 'zod'
import { toast } from 'sonner'
import { DataCreate, CreateFieldConfig } from '@/components/admin/data-create'
import { useRouter } from '@/navigation'
import { useTranslations } from 'next-intl'
import { fetchFiles } from '@/actions/file/file.admin.actions'
import { Difficulty } from '@prisma/client'
import { fetchTracks } from '@/actions/track/track.admin.action'
import { createChallengeAction } from '@/actions/challenge/challenge.admin.action'

export default function CreateChallengePage() {
  const router = useRouter()
  const t = useTranslations('Admin')
  const tGlobal = useTranslations('Admin.Global')
  const tChall = useTranslations('Admin.Challenges')

  // 1. Schéma de validation
  const createChallengeSchema = z.object({
    title: z.string().min(2, { message: tChall('validation.titleTooShort') }),

    description: z.string().optional(),

    location: z
      .string()
      .min(2, { message: tChall('validation.locationTooShort') }),

    // Enum pour la difficulté
    difficulty: z.nativeEnum(Difficulty),

    visible: z.boolean().default(false),

    // Relations fichiers (Optionnels à la création)
    coverId: z.string().optional().nullable(),
    bannerId: z.string().optional().nullable(),

    // Relation Tracks (Tableau d'IDs ordonné)
    trackIds: z.array(z.string()).default([]),
  })

  // On déduit le type TS (Input)
  type FormInput = z.input<typeof createChallengeSchema>

  // --- Fonctions de fetch pour les sélecteurs ---

  // Pour les tracks : on map 'title' vers 'name' pour le composant générique
  const fetchTracksForRelation = async (params: {
    skip: number
    take: number
    search?: string
  }) => {
    const res = await fetchTracks(params)
    return {
      data: res.data.map((t) => ({ id: t.id, name: t.title })),
      total: res.total,
    }
  }

  // Pour les fichiers : on map 'filename' vers 'name'
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

  // 2. Configuration des champs
  const fields: CreateFieldConfig<FormInput>[] = [
    {
      name: 'title',
      label: tGlobal('title'),
      type: 'text',
      placeholder: 'Ex: Grand Chelem Parisien',
      className: 'col-span-1 md:col-span-2',
    },
    {
      name: 'location',
      label: tChall('location'),
      type: 'text',
      placeholder: 'Paris, France',
    },
    {
      name: 'difficulty',
      label: tChall('difficulty'),
      type: 'select',
      options: [
        { label: tChall('Difficulties.EASY'), value: Difficulty.EASY },
        { label: tChall('Difficulties.MEDIUM'), value: Difficulty.MEDIUM },
        { label: tChall('Difficulties.HARD'), value: Difficulty.HARD },
        { label: tChall('Difficulties.EXPERT'), value: Difficulty.EXPERT },
      ],
    },
    {
      name: 'trackIds',
      label: t('Navbar.tracks'),
      type: 'relation',
      relationFetch: fetchTracksForRelation,
      relationMode: 'multiple',
      relationOrdered: true,
      placeholder: "Sélectionner les étapes dans l'ordre...",
      className: 'col-span-1 md:col-span-2',
    },
    {
      name: 'visible',
      label: tGlobal('visible'),
      type: 'boolean',
      description: 'Rendre ce challenge visible publiquement ?',
    },
    {
      name: 'description',
      label: tGlobal('description'),
      type: 'textarea',
      placeholder: 'Description du challenge...',
      className: 'col-span-1 md:col-span-2',
    },
    // Fichiers
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
  ]

  // 3. Soumission
  const handleSubmit = async (
    values: z.output<typeof createChallengeSchema>
  ) => {
    try {
      const result = await createChallengeAction({
        ...values,
        description: values.description || undefined,
        coverId: values.coverId || undefined,
        bannerId: values.bannerId || undefined,
        trackIds: values.trackIds || [],
      })

      if (!result.success) {
        toast.error(result.error || t('Actions.unknownError'))
        return
      }

      toast.success(tChall('createSuccess'))
      router.push(`/admin/challenges/${result.data}`)
    } catch (error) {
      console.error(error)
      toast.error(t('Actions.unknownError'))
    }
  }

  return (
    <div className="container max-w-2xl mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          {tChall('createTitle')}
        </h1>
        <p className="text-muted-foreground">{tChall('createSubtitle')}</p>
      </div>

      <DataCreate
        schema={createChallengeSchema}
        fields={fields}
        defaultValues={{
          title: '',
          description: '',
          location: '',
          difficulty: Difficulty.MEDIUM,
          visible: false,
          trackIds: [],
          coverId: null,
          bannerId: null,
        }}
        onSubmit={handleSubmit}
        submitLabel={t('Actions.save')}
        onCancel={() => router.back()}
      />
    </div>
  )
}

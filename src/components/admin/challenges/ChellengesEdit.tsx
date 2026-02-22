'use client'

import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { DataUpdate, UpdateFieldConfig } from '@/components/admin/data-update'
import { useTranslations } from 'next-intl'
import { fetchTracks } from '@/actions/track/track.admin.action'
import { fetchFiles } from '@/actions/file/file.admin.actions'
import { Difficulty } from '@prisma/client'
import { ChallengeWithRelations } from '@/actions/challenge/challenge.admin.type'
import { updateChallengeAction } from '@/actions/challenge/challenge.admin.action'

interface ChallengeEditPageProps {
  challenge: ChallengeWithRelations
}

export default function ChallengeEdit({ challenge }: ChallengeEditPageProps) {
  const router = useRouter()
  const t = useTranslations('Admin')
  const tGlobal = useTranslations('Admin.Global')
  const tChall = useTranslations('Admin.Challenges')

  // 1. Schéma de validation (Similaire à la création)
  const challengeFormSchema = z.object({
    title: z.string().min(2, { message: tChall('validation.titleTooShort') }),
    description: z.string().optional().nullable(),
    location: z
      .string()
      .min(2, { message: tChall('validation.locationTooShort') }),
    difficulty: z.nativeEnum(Difficulty),
    visible: z.boolean(),

    // Relations
    coverId: z.string().optional().nullable(),
    bannerId: z.string().optional().nullable(),
    trackIds: z.array(z.string()).optional(),
  })

  // Types déduits
  type FormInput = z.input<typeof challengeFormSchema>
  type FormOutput = z.output<typeof challengeFormSchema>

  // --- Fonctions de fetch (identiques à la création) ---

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

  // --- Préparation des données initiales pour les relations ---
  // On trie les tracks existants par ordre pour l'affichage initial
  const sortedTracks = [...challenge.tracks].sort((a, b) => a.order - b.order)

  const initialTracksData = sortedTracks.map((t) => ({
    id: t.track.id,
    name: t.track.title,
  }))

  // 2. Configuration des champs
  const fields: UpdateFieldConfig<FormInput>[] = [
    {
      name: 'title',
      label: tGlobal('title'),
      type: 'text',
      placeholder: 'Ex: Grand Chelem Parisien',
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
      relationOrdered: true, // Affiche les numéros (1, 2, 3...)
      // ⚡️ IMPORTANT : On passe les données initiales pour que le sélecteur affiche les noms
      relationInitialData: initialTracksData,
      placeholder: "Modifier l'ordre ou ajouter des étapes...",
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
    },
    // Fichiers
    {
      name: 'coverId',
      label: t('Files.cover'),
      type: 'relation',
      relationFetch: fetchFilesForRelation,
      relationMode: 'single',
      relationInitialData: challenge.cover
        ? [{ id: challenge.cover.id, name: challenge.cover.filename }]
        : [],
      placeholder: t('Files.placeholderCover'),
    },
    {
      name: 'bannerId',
      label: t('Files.banner'),
      type: 'relation',
      relationFetch: fetchFilesForRelation,
      relationMode: 'single',
      relationInitialData: challenge.banner
        ? [{ id: challenge.banner.id, name: challenge.banner.filename }]
        : [],
      placeholder: t('Files.placeholderBanner'),
    },
  ]

  // 3. Soumission
  const handleSubmit = async (values: FormOutput) => {
    try {
      const result = await updateChallengeAction({
        id: challenge.id,
        ...values,
        description: values.description || null,
        coverId: values.coverId || null, // null pour supprimer si désélectionné
        bannerId: values.bannerId || null,
        trackIds: values.trackIds || [],
      })

      if (!result.success) {
        toast.error(result.error || t('updateError'))
      } else {
        toast.success(tChall('updateSuccess'))
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
          {tChall('updateTitle')}
        </h1>
        <p className="text-muted-foreground mt-2">
          {tChall('updateSubtitle', { title: challenge.title })}
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <DataUpdate
          schema={challengeFormSchema}
          fields={fields}
          defaultValues={{
            title: challenge.title,
            description: challenge.description || '',
            location: challenge.location,
            difficulty: challenge.difficulty,
            visible: challenge.visible,
            // On map les tracks existants vers un tableau d'IDs simple pour le formulaire
            trackIds: sortedTracks.map((t) => t.trackId),
            coverId: challenge.coverId,
            bannerId: challenge.bannerId,
          }}
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
          submitLabel={t('Actions.update')}
        />
      </div>
    </div>
  )
}

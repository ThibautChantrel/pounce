import { notFound } from 'next/navigation'
import ShowLayout from '@/components/admin/ShowLayout'
import { Badge } from '@/components/ui/badge'
import { DataDetails, FieldConfig } from '@/components/admin/data-details'
import { getTranslations } from 'next-intl/server'
import { ChallengeWithRelations } from '@/actions/challenge/challenge.admin.type' // Ou le chemin vers tes types
import { FileData } from '@/actions/file/file.admin.type'
import { getChallengeAction } from '@/actions/challenge/challenge.admin.action'

type PageProps = {
  params: Promise<{ id: string; locale: string }>
}

export default async function ChallengeShowPage(props: PageProps) {
  const params = await props.params
  const t = await getTranslations('Admin.Challenges')
  const tGlobal = await getTranslations('Admin.Global')
  const tFiles = await getTranslations('Admin.Files')
  const tAdmin = await getTranslations('Admin')

  const challenge = await getChallengeAction(params.id)

  if (!challenge) {
    notFound()
  }

  const difficultyVariants: Record<
    string,
    'default' | 'secondary' | 'destructive' | 'outline'
  > = {
    EASY: 'secondary',
    MEDIUM: 'default',
    HARD: 'destructive',
    EXPERT: 'destructive',
  }

  const challengeFields: FieldConfig<ChallengeWithRelations>[] = [
    {
      label: tGlobal('title'),
      key: 'title',
      type: 'string',
      className: 'font-semibold text-lg',
    },
    {
      label: t('location'),
      key: 'location',
      type: 'string',
    },
    {
      label: t('difficulty'),
      key: 'difficulty',
      type: 'badge',
      badgeVariants: difficultyVariants,
    },
    {
      label: tGlobal('visible'),
      key: 'visible',
      type: 'custom',
      getValue: (item) => (
        <Badge variant={item.visible ? 'default' : 'secondary'}>
          {item.visible ? tGlobal('visible') : tGlobal('hidden')}
        </Badge>
      ),
    },

    {
      label: tAdmin('Navbar.tracks'),
      key: 'tracks',
      type: 'link-list',
      getValue: (item) => {
        const sortedTracks = [...item.tracks].sort((a, b) => a.order - b.order)

        // On map vers le format attendu par DataDetails { label, url }
        return sortedTracks.map((t, index) => ({
          label: `${index + 1}. ${t.track.title}`, // Ex: "1. Traversée de Paris"
          url: `/admin/tracks/${t.track.id}`,
        }))
      },
    },

    {
      label: tGlobal('description'),
      key: 'description',
      type: 'custom',
      getValue: (item) => (
        <p className="text-muted-foreground whitespace-pre-wrap text-sm">
          {item.description || '-'}
        </p>
      ),
    },
    {
      label: tGlobal('createdAt'),
      key: 'createdAt',
      type: 'date',
    },
    {
      label: tGlobal('createdBy'),
      key: 'createdById',
      type: 'string',
      className: 'font-mono text-xs text-muted-foreground',
    },
    {
      label: tGlobal('updatedAt'),
      key: 'updatedAt',
      type: 'date',
    },

    // --- FICHIERS ---
    {
      label: tFiles('cover'),
      key: 'cover',
      type: 'file',
      getValue: (item) => item.cover as FileData | null,
    },
    {
      label: tFiles('banner'),
      key: 'banner',
      type: 'file',
      getValue: (item) => item.banner as FileData | null,
    },
  ]

  return (
    <ShowLayout module="challenges">
      <div className="space-y-6">
        <DataDetails
          title={tGlobal('details')}
          description={`ID: ${challenge.id}`}
          data={challenge}
          fields={challengeFields}
        />
      </div>
    </ShowLayout>
  )
}

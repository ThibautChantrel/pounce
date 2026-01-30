import { notFound } from 'next/navigation'
import ShowLayout from '@/components/admin/ShowLayout'
import { Badge } from '@/components/ui/badge'
import { DataDetails, FieldConfig } from '@/components/admin/data-details' // Ton fichier
import { getTranslations } from 'next-intl/server'
import { TrackWithRelations } from '@/server/modules/track/track.types'
import { FileData } from '@/actions/file/file.admin.type'
import { getTrackAction } from '@/actions/track/track.admin.action'

type PageProps = {
  params: Promise<{ id: string; locale: string }>
}

export default async function TrackShowPage(props: PageProps) {
  const params = await props.params
  const t = await getTranslations('Admin.Tracks')
  const tGlobal = await getTranslations('Admin.Global')
  const tAdmin = await getTranslations('Admin')

  const track = await getTrackAction(params.id)

  if (!track) {
    notFound()
  }

  // Configuration des champs
  const trackFields: FieldConfig<TrackWithRelations>[] = [
    {
      label: tGlobal('title'),
      key: 'title',
      type: 'string',
      className: 'font-semibold text-lg',
    },
    {
      label: t('distance'),
      key: 'distance',
      type: 'custom', // Custom pour ajouter "km"
      getValue: (item) => <span className="font-mono">{item.distance} km</span>,
    },
    {
      label: t('elevationGain'),
      key: 'elevationGain',
      type: 'custom', // Custom pour ajouter "km"
      getValue: (item) => (
        <span className="font-mono">{item.elevationGain ?? 0} m</span>
      ),
    },
    {
      label: t('visible'),
      key: 'visible',
      type: 'custom',
      getValue: (item) => (
        <Badge variant={item.visible ? 'default' : 'secondary'}>
          {item.visible ? tGlobal('visible') : tGlobal('hidden')}
        </Badge>
      ),
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
      label: tAdmin('Navbar.pois'),
      key: 'pois',
      type: 'link-list',
      getValue: (item) => {
        if (!item.pois || item.pois.length === 0) {
          return t('noPois')
        }

        return item.pois.map((p, index) => ({
          label: `${index + 1}. ${p.name}`,
          url: `/admin/pois/${p.id}`,
        }))
      },
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
    {
      label: tGlobal('updatedBy'),
      key: 'updatedById',
      type: 'string',
      className: 'font-mono text-xs text-muted-foreground',
    },
    {
      label: 'Image de couverture',
      key: 'cover',
      type: 'file',
      getValue: (item) => item.cover as FileData | null,
    },
    {
      label: 'Bannière',
      key: 'banner',
      type: 'file',
      getValue: (item) => item.banner as FileData | null,
    },
    {
      label: 'Fichier GPX',
      key: 'gpxFile',
      type: 'file',
      getValue: (item) => item.gpxFile as FileData | null,
    },
  ]

  return (
    <ShowLayout module="tracks">
      <div className="space-y-6">
        <DataDetails
          title={tGlobal('details')}
          description={`ID: ${track.id}`}
          data={track}
          fields={trackFields}
        />
      </div>
    </ShowLayout>
  )
}

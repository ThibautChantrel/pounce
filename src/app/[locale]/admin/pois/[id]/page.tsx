import { notFound } from 'next/navigation'
// 👇 Import de ton action POI
import ShowLayout from '@/components/admin/ShowLayout'
import { Badge } from '@/components/ui/badge'
import { DataDetails, FieldConfig } from '@/components/admin/data-details'
import { getTranslations } from 'next-intl/server'
import { Poi } from '@prisma/client' // Import des types Prisma
import { getPoiAction } from '@/actions/poi/poi.admin.actions'
import { PoiTypeVariants } from '@/utils/pois'

type PageProps = {
  params: Promise<{ id: string; locale: string }>
}

export default async function PoiShowPage(props: PageProps) {
  const params = await props.params
  const t = await getTranslations('Admin.Pois')

  const poi = await getPoiAction(params.id)

  if (!poi) {
    notFound()
  }

  const poiFields: FieldConfig<Poi>[] = [
    {
      label: t('name'),
      key: 'name',
      className: 'font-semibold text-lg',
    },
    {
      label: t('type'),
      key: 'type',
      type: 'badge',
      badgeVariants: PoiTypeVariants,
    },
    {
      label: t('coordinates'),
      key: 'latitude',
      type: 'custom',
      getValue: (p: Poi) => (
        <div className="flex items-center gap-2 font-mono text-sm">
          <Badge variant="outline" className="text-muted-foreground">
            Lat: {p.latitude.toFixed(5)}
          </Badge>
          <Badge variant="outline" className="text-muted-foreground">
            Lon: {p.longitude.toFixed(5)}
          </Badge>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${p.latitude},${p.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline ml-2"
          >
            Voir sur la carte ↗
          </a>
        </div>
      ),
    },
    {
      label: t('description'),
      key: 'description',
      type: 'custom',
      getValue: (p: Poi) => (
        <p className="text-muted-foreground whitespace-pre-wrap">
          {p.description || '-'}
        </p>
      ),
    },
    {
      label: t('createdAt'),
      key: 'createdAt',
      type: 'date',
    },
    {
      label: t('createdAt'),
      key: 'updatedAt',
      type: 'date',
    },
  ]

  return (
    // 👇 Module "pois" pour activer le bon onglet dans la sidebar (si tu as cette logique)
    <ShowLayout module="pois">
      <div className="space-y-6">
        <DataDetails
          title={t('title')} // "Gestion des Lieux" ou "Détails du lieu"
          description={`ID: ${poi.id}`}
          data={poi}
          fields={poiFields}
        />
      </div>
    </ShowLayout>
  )
}

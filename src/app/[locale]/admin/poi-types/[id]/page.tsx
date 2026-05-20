import { notFound } from 'next/navigation'
import ShowLayout from '@/components/admin/ShowLayout'
import { DataDetails, FieldConfig } from '@/components/admin/data-details'
import { getTranslations } from 'next-intl/server'
import { PoiTypeWithRelations } from '@/server/modules/poi-type/poi-type.types'
import { getPoiTypeAction } from '@/actions/poi-type/poi-type.admin.action'

type PageProps = {
  params: Promise<{ id: string; locale: string }>
}

export default async function PoiTypeShowPage(props: PageProps) {
  const params = await props.params
  const t = await getTranslations('Admin.PoiTypes')
  const tGlobal = await getTranslations('Admin.Global')

  const poiType = await getPoiTypeAction(params.id)

  if (!poiType) {
    notFound()
  }

  const fields: FieldConfig<PoiTypeWithRelations>[] = [
    {
      label: t('value'),
      key: 'value',
      type: 'string',
      className: 'font-semibold text-lg',
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
    {
      label: tGlobal('updatedBy'),
      key: 'updatedById',
      type: 'string',
      className: 'font-mono text-xs text-muted-foreground',
    },
  ]

  return (
    <ShowLayout module="poi-types">
      <div className="space-y-6">
        <DataDetails
          title={tGlobal('details')}
          description={`ID: ${poiType.id}`}
          data={poiType}
          fields={fields}
        />
      </div>
    </ShowLayout>
  )
}

import { notFound } from 'next/navigation'
import ShowLayout from '@/components/admin/ShowLayout'
import { DataDetails, FieldConfig } from '@/components/admin/data-details'
import { getTranslations } from 'next-intl/server'
import { CategoryWithRelations } from '@/server/modules/category/category.types'
import { getCategoryAction } from '@/actions/category/category.admin.action'

type PageProps = {
  params: Promise<{ id: string; locale: string }>
}

export default async function CategoryShowPage(props: PageProps) {
  const params = await props.params
  const t = await getTranslations('Admin.Categories')
  const tGlobal = await getTranslations('Admin.Global')

  const category = await getCategoryAction(params.id)

  if (!category) {
    notFound()
  }

  const fields: FieldConfig<CategoryWithRelations>[] = [
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
    <ShowLayout module="categories">
      <div className="space-y-6">
        <DataDetails
          title={tGlobal('details')}
          description={`ID: ${category.id}`}
          data={category}
          fields={fields}
        />
      </div>
    </ShowLayout>
  )
}

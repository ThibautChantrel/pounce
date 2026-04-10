import { fetchCategories } from '@/actions/category/category.admin.action'
import CategoriesTable from '@/components/admin/categories/CategoriesTable'
import { parseTableParams } from '@/utils/fetch'
import { getTranslations } from 'next-intl/server'

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function CategoriesPage({ searchParams }: PageProps) {
  const rawParams = await searchParams
  const params = parseTableParams(rawParams)

  const { data, total } = await fetchCategories(params)
  const t = await getTranslations('Admin.Categories')

  return (
    <div className="h-full flex-1 flex-col space-y-8 p-8 flex">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t('title')}</h2>
          <p className="text-muted-foreground">
            {t('description', { count: total })}
          </p>
        </div>
      </div>

      <CategoriesTable data={data} totalItems={total} />
    </div>
  )
}

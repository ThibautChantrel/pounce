import { getCategoryAction } from '@/actions/category/category.admin.action'
import CategoriesEdit from '@/components/admin/categories/CategoriesEdit'
import { notFound } from 'next/navigation'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function CategoryEditPage(props: PageProps) {
  const params = await props.params

  const category = await getCategoryAction(params.id)

  if (!category) {
    notFound()
  }

  return <CategoriesEdit category={category} />
}

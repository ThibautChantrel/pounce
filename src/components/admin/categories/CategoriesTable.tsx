'use client'

import { CategoryColumn, useCategoryColumns } from '@/admin/category.columns'
import { DataTable } from '@/components/admin/data-table'

interface CategoriesTableProps {
  data: CategoryColumn[]
  totalItems: number
}

export default function CategoriesTable({
  data,
  totalItems,
}: CategoriesTableProps) {
  const columns = useCategoryColumns()

  return <DataTable columns={columns} data={data} totalItems={totalItems} />
}

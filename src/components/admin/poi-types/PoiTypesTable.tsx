'use client'

import { PoiTypeColumn, usePoiTypeColumns } from '@/admin/poi-type.columns'
import { DataTable } from '@/components/admin/data-table'

interface PoiTypesTableProps {
  data: PoiTypeColumn[]
  totalItems: number
}

export default function PoiTypesTable({
  data,
  totalItems,
}: PoiTypesTableProps) {
  const columns = usePoiTypeColumns()

  return <DataTable columns={columns} data={data} totalItems={totalItems} />
}

'use client'

import { PoiColumn, usePoiColumns } from '@/admin/poi.columns'
import { DataTable } from '@/components/admin/data-table'

interface PoisTableProps {
  data: PoiColumn[]
  totalItems: number
}

export default function PoisTable({ data, totalItems }: PoisTableProps) {
  const columns = usePoiColumns()

  return (
    <DataTable
      columns={columns}
      data={data}
      totalItems={totalItems}
      import={true}
    />
  )
}

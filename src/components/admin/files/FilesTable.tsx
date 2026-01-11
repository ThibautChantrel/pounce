'use client'

import { FileColumn, useFileColumns } from '@/admin/file.columns'
import { DataTable } from '@/components/admin/data-table'

interface FileTableProps {
  data: FileColumn[]
  totalItems: number
}

export default function FilesTable({ data, totalItems }: FileTableProps) {
  const columns = useFileColumns()

  return <DataTable columns={columns} data={data} totalItems={totalItems} />
}

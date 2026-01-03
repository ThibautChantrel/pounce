'use client'

import { UserColumn, useUserColumns } from '@/admin/user.columns'
import { DataTable } from '@/components/admin/data-table'

interface UsersTableProps {
  data: UserColumn[]
  totalItems: number
}

export default function UsersTable({ data, totalItems }: UsersTableProps) {
  const columns = useUserColumns()

  return <DataTable columns={columns} data={data} totalItems={totalItems} />
}

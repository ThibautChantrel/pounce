import { notFound } from 'next/navigation'
import { FileData, getFile } from '@/actions/file/file.admin.actions'
import FileDetails from '@/components/FileDetails'
import ShowLayout from '@/components/admin/ShowLayout'
import { DataDetails, FieldConfig } from '@/components/admin/data-details'

type PageProps = {
  params: Promise<{ id: string; locale: string }>
}

export default async function FileShowPage(props: PageProps) {
  const params = await props.params

  const file: FileData = await getFile(params.id)

  if (!file) {
    notFound()
  }

  const fileFields: FieldConfig<FileData>[] = [
    {
      label: 'Fichier test',
      type: 'file',
      getValue: (data) => data,
    },
  ]

  return (
    <ShowLayout module="files">
      <div className="space-y-6">
        <DataDetails
          title="Informations du compte"
          description={`ID: ${file.id}`}
          data={file}
          fields={fileFields}
        />
      </div>
    </ShowLayout>
  )
}

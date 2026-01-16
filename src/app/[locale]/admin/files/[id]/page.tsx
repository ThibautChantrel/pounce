import { notFound } from 'next/navigation'
import { getFile } from '@/actions/file/file.admin.actions'
import FileDetails from '@/components/FileDetails'
import ShowLayout from '@/components/admin/ShowLayout'
import { DataDetails, FieldConfig } from '@/components/admin/data-details'
import { FileData } from '@/actions/file/file.admin.type'

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

  /* const file: FileData = await getFile(params.id)
  const file2: FileData = await getFile('cmk5vh6500002o7y4u08e9iqq')

  if (!file) {
    notFound()
  }

  const displayData = {
    allFiles: [file, file2].filter(Boolean) as FileData[]
  }

  const fileFields: FieldConfig<typeof displayData>[] = [
    {
      label: 'Liste de fichiers (Test double)',
      type: 'file-list',
      getValue: (data) => data.allFiles,
    },
  ]

  return (
    <ShowLayout module="files">
      <div className="space-y-6">
        <DataDetails
          title="Informations du compte"
          description={`ID: ${file.id}`} 
          data={displayData}
          fields={fileFields}
        />
      </div>
    </ShowLayout>
  )
} */

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

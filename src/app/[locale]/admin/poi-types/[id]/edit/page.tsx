import { notFound } from 'next/navigation'
import { getPoiTypeAction } from '@/actions/poi-type/poi-type.admin.action'
import PoiTypesEdit from '@/components/admin/poi-types/PoiTypesEdit'

type PageProps = {
  params: Promise<{ id: string; locale: string }>
}

export default async function PoiTypeEditPage(props: PageProps) {
  const params = await props.params
  const poiType = await getPoiTypeAction(params.id)

  if (!poiType) {
    notFound()
  }

  return <PoiTypesEdit poiType={poiType} />
}

import { getPoiAction } from '@/actions/poi/poi.admin.actions'
import PoiEdit from '@/components/admin/pois/PoisEdit'
import { notFound } from 'next/navigation'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function PoiEditPage(props: PageProps) {
  const params = await props.params

  const user = await getPoiAction(params.id)

  if (!user) {
    notFound()
  }

  return <PoiEdit poi={user} />
}

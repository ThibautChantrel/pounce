import { getTrackAction } from '@/actions/track/track.admin.action'
import TrackEditPage from '@/components/admin/tracks/TracksEdit'
import { X } from 'lucide-react'
import { notFound } from 'next/navigation'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function FileEditPage(props: PageProps) {
  const params = await props.params

  const track = await getTrackAction(params.id)

  if (!track) {
    notFound()
  }

  return <TrackEditPage track={track} />
}

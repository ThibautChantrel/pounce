'use client'

import dynamic from 'next/dynamic'
import { TrackMapPlaceholder } from './TrackMapPlaceHolder'
import { GpxViewerProps } from '@/components/GpxViewer'

const GpxViewer = dynamic(() => import('@/components/GpxViewer'), {
  ssr: false,
  loading: () => <TrackMapPlaceholder />,
})

export function TrackGpxMap(props: GpxViewerProps) {
  if (!props.customUrl) {
    return <TrackMapPlaceholder />
  }
  return <GpxViewer {...props} />
}

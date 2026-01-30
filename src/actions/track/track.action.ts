'use server'

import { trackServiceUser } from '@/server/modules/track/services/track.service'

export async function getTrackAction(id: string) {
  const track = await trackServiceUser.get(id)
  if (!track) {
    return null
  }
  return track
}

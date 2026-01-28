'use server'

import { BusinessError, ERROR_CODES } from '@/core/errors'
import { TrackWithPoisDistance } from './track.types'
import { trackServiceUser } from '@/server/modules/track/services/track.service'

export async function getTrackAction(
  id: string
): Promise<TrackWithPoisDistance> {
  const track = await trackServiceUser.get(id)
  if (!track) {
    throw new BusinessError(ERROR_CODES.NOT_FOUND, "Le parcours n'existe pas")
  }
  return track
}

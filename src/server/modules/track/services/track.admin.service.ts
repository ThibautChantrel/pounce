import { auth } from '@/server/modules/auth/auth.config'
import { BusinessError, ERROR_CODES } from '@/core/errors'
import { trackRepository } from '../repositories/track.repository'
import {
  CreateTrackInput,
  UpdateTrackInput,
  TrackWithRelations,
} from '../track.types'

export class TrackService {
  private async getAuthenticatedUserId(): Promise<string> {
    const session = await auth()
    if (!session?.user?.id)
      throw new BusinessError(ERROR_CODES.UNAUTHORIZED, 'Unauthorized')
    return session.user.id
  }

  async create(data: CreateTrackInput) {
    const userId = await this.getAuthenticatedUserId()

    const existingTracks = await trackRepository.getAll(0, 1, data.title)

    const duplicate = existingTracks.data.find(
      (t) => t.title.toLowerCase() === data.title.toLowerCase()
    )

    if (duplicate) {
      throw new BusinessError(
        ERROR_CODES.TRACK_SAME_TITLE_ALREADY_EXISTS,
        'Action Impossible, il existe déjà un parcours avec ce titre'
      )
    }

    return await trackRepository.create(data, userId)
  }

  async update(data: UpdateTrackInput) {
    const userId = await this.getAuthenticatedUserId()

    const existing = await trackRepository.findById(data.id)
    if (!existing) {
      throw new BusinessError(ERROR_CODES.NOT_FOUND, 'Parcours introuvable')
    }

    if (data.title && data.title !== existing.title) {
      const tracksWithSameName = await trackRepository.getAll(0, 10, data.title)
      const duplicate = tracksWithSameName.data.find(
        (t) =>
          t.title.toLowerCase() === data.title?.toLowerCase() &&
          t.id !== data.id
      )

      if (duplicate) {
        throw new BusinessError(
          ERROR_CODES.TRACK_SAME_TITLE_ALREADY_EXISTS,
          'Action Impossible, un autre parcours possède déjà ce titre'
        )
      }
    }

    return await trackRepository.update(data, userId)
  }

  async delete(id: string) {
    await this.getAuthenticatedUserId()

    const existing = await trackRepository.findById(id)
    if (!existing) {
      throw new BusinessError(ERROR_CODES.NOT_FOUND, 'Parcours introuvable')
    }

    return await trackRepository.delete(id)
  }

  getAllTracks = async (skip = 0, take = 10, search?: string) => {
    return await trackRepository.getAll(skip, take, search)
  }

  async get(id: string): Promise<TrackWithRelations | null> {
    return await trackRepository.findById(id)
  }

  async getSimpleList() {
    await this.getAuthenticatedUserId()
    return await trackRepository.findAllSimple()
  }
}

export const trackService = new TrackService()

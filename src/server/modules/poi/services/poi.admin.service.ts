import { auth } from '@/server/modules/auth/auth.config'
import { BusinessError, ERROR_CODES } from '@/core/errors'
import { poiRepository } from '../repositories/poi.repository'
import {
  CreateManyPoiInput,
  CreatePoiInput,
  Poi,
  UpdatePoiInput,
} from '../poi.types'
import { FetchParams } from '@/utils/fetch'

export class PoiService {
  private async getAuthenticatedUserId(): Promise<string> {
    const session = await auth()
    if (!session?.user?.id)
      throw new BusinessError(ERROR_CODES.UNAUTHORIZED, 'Unauthorized')
    return session.user.id
  }

  async create(data: CreatePoiInput) {
    const userId = await this.getAuthenticatedUserId()
    console.log('OKOKOK')

    const duplicate = await poiRepository.findByName(data.name)

    if (duplicate)
      throw new BusinessError(
        ERROR_CODES.POI_SAME_NAME_ALREADY_EXISTS,
        'Action Impossible, il existe déjà un poi avec le même name'
      )
    return await poiRepository.create(data, userId)
  }

  async update(data: UpdatePoiInput) {
    const userId = await this.getAuthenticatedUserId()
    const existing = await poiRepository.findById(data.id)
    if (!existing)
      throw new BusinessError(ERROR_CODES.NOT_FOUND, 'POI introuvable')
    if (data.name && data.name != existing.name) {
      const duplicates = await poiRepository.findMultipleByName(data.name)
      if (duplicates.length > 2)
        throw new BusinessError(
          ERROR_CODES.POI_SAME_NAME_ALREADY_EXISTS,
          'Action Impossible, il existe déjà un poi avec le même name'
        )
    }
    return await poiRepository.update(data, userId)
  }

  async delete(id: string) {
    await this.getAuthenticatedUserId()
    return await poiRepository.delete(id)
  }

  getAllPois = async (params: FetchParams) => {
    return await poiRepository.getAll(params)
  }

  async get(id: string): Promise<Poi | null> {
    return await poiRepository.findById(id)
  }
  async bulkCreate(poisData: CreatePoiInput[], userId?: string) {
    const existingPois = await poiRepository.getExistingForValidation()

    const existingNames = new Set(existingPois.map((p) => p.name.toLowerCase()))
    const existingCoords = new Set(
      existingPois.map(
        (p) => `${p.latitude.toFixed(5)},${p.longitude.toFixed(5)}`
      )
    )

    // 2. Filtrer les données entrantes (En mémoire, instantané)
    const validPoisToInsert: CreateManyPoiInput[] = []
    let skippedCount = 0

    for (const poi of poisData) {
      const nameKey = poi.name.toLowerCase()
      const coordKey = `${Number(poi.latitude).toFixed(5)},${Number(poi.longitude).toFixed(5)}`

      // Vérification des doublons
      if (existingNames.has(nameKey) || existingCoords.has(coordKey)) {
        skippedCount++
        continue
      }

      // Ajout à la liste d'insertion
      validPoisToInsert.push({
        ...poi,
        createdById: userId || null, // On passe la FK directement pour createMany
      })

      // Mise à jour des Sets pour empêcher les doublons au sein du fichier Excel
      existingNames.add(nameKey)
      existingCoords.add(coordKey)
    }

    // 3. Interaction BD N°2 : Insertion en masse via le Repo
    if (validPoisToInsert.length > 0) {
      await poiRepository.createMany(validPoisToInsert)
    }

    return {
      inserted: validPoisToInsert.length,
      skipped: skippedCount,
    }
  }
}

export const poiService = new PoiService()

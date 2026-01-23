'use client'

import Image from 'next/image'
import { Link } from '@/navigation'
import { Map, Mountain, Trophy, ArrowRight } from 'lucide-react'
import { ChallengeWithRelations } from '@/actions/challenge/challenge.admin.type'

interface ChallengeCardProps {
  challenge: ChallengeWithRelations
}

export function ChallengeCard({ challenge }: ChallengeCardProps) {
  const trackCount = challenge.tracks.length

  const totalDistance = challenge.tracks.reduce(
    (acc, curr) => acc + curr.track.distance,
    0
  )

  const totalElevation = challenge.tracks.reduce(
    (acc, curr) => acc + (curr.track.elevationGain || 0),
    0
  )

  const imageUrl = challenge.cover
    ? `/api/files/${challenge.coverId}`
    : '/images/placeholder-challenge.jpg'

  return (
    <Link href={`/challenges/${challenge.id}`} className="block h-full">
      <div className="group relative h-112.5 w-full overflow-hidden rounded-2xl cursor-pointer">
        {/* --- COUCHE 1 : IMAGE DE FOND --- */}
        <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-105">
          <Image
            src={imageUrl}
            alt={challenge.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {/* Overlay sombre pour lisibilité texte par défaut */}
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-0" />
        </div>

        {/* --- COUCHE 2 : FOND "CLAY" (ARGILE) AU SURVOL --- */}
        <div className="absolute inset-0 bg-clay opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <div className="relative h-full flex flex-col justify-between p-6 text-white">
          <div className="z-10">
            <h3 className="text-2xl font-bold uppercase tracking-wider font-heading">
              {challenge.title}
            </h3>
            {/* Le lieu s'affiche aussi pour le contexte */}
            <p className="text-sm font-medium opacity-90 mt-1 flex items-center gap-1">
              <Map className="w-3 h-3" /> {challenge.location}
            </p>
          </div>

          {/* CENTRE : TEXTE AU SURVOL UNIQUEMENT */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-300 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0">
            <div className="text-center px-4">
              <p className="text-lg font-medium mb-4">
                {challenge.description
                  ? challenge.description.slice(0, 100) + '...'
                  : 'Prêt à relever le défi ?'}
              </p>
              <span className="inline-flex items-center gap-2 border border-white/30 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm text-sm font-bold hover:bg-white hover:text-[#bd7e5b] transition-colors">
                Voir le détail <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>

          <div className="z-10 grid grid-cols-3 gap-2 transition-opacity duration-300 group-hover:opacity-0">
            <div className="flex flex-col items-start border-l-2 border-white/50 pl-3">
              <span className="text-xs uppercase opacity-70">Parcours</span>
              <div className="flex items-center gap-1 text-lg font-bold">
                <Trophy className="w-4 h-4" />
                {trackCount}
              </div>
            </div>

            <div className="flex flex-col items-start border-l-2 border-white/50 pl-3">
              <span className="text-xs uppercase opacity-70">Distance</span>
              <div className="flex items-center gap-1 text-lg font-bold">
                <Map className="w-4 h-4" />
                {totalDistance.toFixed(1)} <span className="text-xs">km</span>
              </div>
            </div>

            <div className="flex flex-col items-start border-l-2 border-white/50 pl-3">
              <span className="text-xs uppercase opacity-70">Dénivelé</span>
              <div className="flex items-center gap-1 text-lg font-bold">
                <Mountain className="w-4 h-4" />
                {totalElevation} <span className="text-xs">m</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

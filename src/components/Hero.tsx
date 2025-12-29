import { ChevronDown } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative w-full h-screen overflow-hidden">
      {/* 1. BACKGROUND VIDEO */}
      {/* Remplacez '/hero-video.mp4' par votre fichier dans le dossier public/ */}
      <video
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
        src="hero.mp4"
        autoPlay
        loop
        muted
        playsInline // Important pour iOS
      />

      {/* 2. OVERLAY (Filtre sombre) */}
      {/* bg-black/50 signifie noir à 50% d'opacité */}
      <div className="absolute top-0 left-0 w-full h-full bg-black/50 z-10" />

      {/* 3. CONTENU (Texte + Boutons) */}
      <div className="relative z-20 flex flex-col items-center justify-center h-full text-center px-4 space-y-6">
        <h1 className="text-4xl md:text-6xl font-bold text-white max-w-4xl leading-tight">
          Title
        </h1>
      </div>

      {/* 4. INDICATEUR DE SCROLL (Optionnel) */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
        <ChevronDown className="text-white w-10 h-10 opacity-80" />
      </div>
    </section>
  )
}

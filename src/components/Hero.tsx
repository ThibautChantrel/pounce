import { ChevronDown } from 'lucide-react'
import { useEffect, useRef } from 'react'

export default function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    // Recharger la vidéo quand le composant est monté
    if (videoRef.current) {
      videoRef.current.load()
    }
  }, [])
  return (
    <section className="relative w-full h-screen overflow-hidden">
      <video
        ref={videoRef}
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
        src="hero.mp4"
        autoPlay
        loop
        muted
        playsInline
      />

      {/* bg-black/50 signifie noir à 50% d'opacité */}
      <div className="absolute top-0 left-0 w-full h-full bg-black/50 z-10" />

      <div className="relative z-20 flex flex-col items-center justify-center h-full text-center px-4 space-y-6">
        <h1 className="text-4xl md:text-6xl font-bold text-white max-w-4xl leading-tight">
          Title
        </h1>
      </div>

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
        <ChevronDown className="text-white w-10 h-10 opacity-80" />
      </div>
    </section>
  )
}

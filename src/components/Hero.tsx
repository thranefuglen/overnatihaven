import { useState, useEffect, useRef, useCallback } from 'react'
import { API_URL, API_BASE_URL } from '../config/api'
import { GalleryImage } from '../types'
import { galleryFallback } from '../data/galleryFallback'

const SLIDE_DURATION = 8000 // ms per slide
const FADE_DURATION = 1500 // ms crossfade

const Hero = () => {
  const [images, setImages] = useState<string[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [nextIndex, setNextIndex] = useState<number | null>(null)
  const [fadeIn, setFadeIn] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch(`${API_URL}/gallery/hero`)
        if (!response.ok) throw new Error('Failed to fetch')
        const data = await response.json()
        const activeImages = (data.data || [])
          .filter((img: GalleryImage) => img.is_active)
          .sort((a: GalleryImage, b: GalleryImage) => a.sort_order - b.sort_order)
          .map((img: GalleryImage) =>
            img.image_url.startsWith('http')
              ? img.image_url
              : `${API_BASE_URL}${img.image_url}`
          )
        if (activeImages.length > 0) setImages(activeImages)
        else setImages(getFallbackUrls())
      } catch {
        setImages(getFallbackUrls())
      }
    }

    const getFallbackUrls = () =>
      galleryFallback
        .filter((img) => img.is_active)
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((img) =>
          img.image_url.startsWith('http')
            ? img.image_url
            : `${API_BASE_URL}${img.image_url}`
        )

    fetchImages()
  }, [])

  // Preload next image
  const preload = useCallback(
    (index: number) => {
      if (images.length === 0) return
      const img = new Image()
      img.src = images[index]
    },
    [images]
  )

  // Start the slideshow cycle
  useEffect(() => {
    if (images.length <= 1) return

    const startTransition = () => {
      const next = (activeIndex + 1) % images.length
      preload(next)
      setNextIndex(next)
      // Small delay to ensure the next layer is mounted before fading in
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setFadeIn(true)
        })
      })

      // After fade completes, promote next to active
      timerRef.current = setTimeout(() => {
        setActiveIndex(next)
        setNextIndex(null)
        setFadeIn(false)
      }, FADE_DURATION)
    }

    const interval = setInterval(startTransition, SLIDE_DURATION)

    // Preload the next image ahead of time
    preload((activeIndex + 1) % images.length)

    return () => {
      clearInterval(interval)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [activeIndex, images.length, preload])

  const scrollToContact = () => {
    const element = document.querySelector('#contact')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const panClass = (index: number) =>
    index % 2 === 0 ? 'hero-pan-left' : 'hero-pan-right'

  return (
    <section id="hero" className="relative min-h-screen flex items-center pt-16 sm:pt-20 overflow-hidden">
      {/* Background Slideshow */}
      <div className="absolute inset-0 z-0">
        {/* Gradient overlay - on top of images */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50 z-10" />

        {/* Active slide (bottom layer) */}
        {images.length > 0 && (
          <div className="absolute inset-0">
            <div
              key={`active-${activeIndex}`}
              className={`absolute inset-[-20%] bg-cover bg-center ${panClass(activeIndex)}`}
              style={{ backgroundImage: `url('${images[activeIndex]}')` }}
            />
          </div>
        )}

        {/* Next slide (top layer, fades in over active) */}
        {nextIndex !== null && (
          <div
            className={`absolute inset-0 transition-opacity ${fadeIn ? 'opacity-100' : 'opacity-0'}`}
            style={{ transitionDuration: `${FADE_DURATION}ms` }}
          >
            <div
              key={`next-${nextIndex}`}
              className={`absolute inset-[-20%] bg-cover bg-center ${panClass(nextIndex)}`}
              style={{ backgroundImage: `url('${images[nextIndex]}')` }}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="relative z-20 section-container text-center text-white">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
          Velkommen til
          <br />
          <span className="text-primary-200">Elins Have</span>
        </h1>
        <p className="text-xl sm:text-2xl md:text-3xl mb-8 text-primary-50 max-w-3xl mx-auto">
          En smuk og fredelig oase for cyklister på eventyr
        </p>
        <p className="text-lg sm:text-xl mb-12 text-white/90 max-w-2xl mx-auto">
          Sæt dit telt op i naturskønne omgivelser og nyd en velfortjent pause på din cykeltur gennem
          Danmark.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={scrollToContact} className="btn-primary text-lg px-8 py-4">
            Book din overnatning
          </button>
          <a
            href="#about"
            onClick={(e) => {
              e.preventDefault()
              const element = document.querySelector('#about')
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' })
              }
            }}
            className="btn-secondary text-lg px-8 py-4"
          >
            Læs mere
          </a>
        </div>

        {/* Features */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Naturnær Beliggenhed</h3>
            <p className="text-white/80">Omgivet af smuk natur og grønne områder</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Gode Faciliteter</h3>
            <p className="text-white/80">Alt hvad du behøver for en behagelig overnatning</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Varm Velkomst</h3>
            <p className="text-white/80">Personlig og hjertelig modtagelse fra Elin</p>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </section>
  )
}

export default Hero

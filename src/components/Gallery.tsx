import { useState, useEffect, useRef } from 'react'
import { API_URL } from '../config/api'
import { GalleryImage } from '../types'
import { galleryFallback } from '../data/galleryFallback'

/**
 * Galleriet vises som en karrusel i stedet for et grid: bedre overblik for
 * brugeren, og kun det aktuelle billede (plus naboerne) hentes fra blob —
 * i modsætning til gridden, hvor alle synlige billeder blev hentet med det samme.
 */
const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null)
  const [images, setImages] = useState<GalleryImage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentSlide, setCurrentSlide] = useState(0)
  // Kun slides der har været aktuelle (eller nabo til en aktuel) får sat src.
  // Én gang hentet forbliver de i sættet, så tilbage-bladring ikke genhenter.
  const [loadedSlides, setLoadedSlides] = useState<Set<number>>(new Set())
  const touchStartX = useRef<number | null>(null)
  const lightboxRef = useRef<HTMLDivElement | null>(null)

  // Flyt fokus ind i lightboxen når den åbner, så Escape/piletaster virker
  useEffect(() => {
    if (selectedImage !== null) lightboxRef.current?.focus()
  }, [selectedImage])

  useEffect(() => {
    fetchImages()
  }, [])

  // Markér aktuel slide + begge naboer som klar til hentning
  useEffect(() => {
    if (images.length === 0) return
    setLoadedSlides((prev) => {
      const next = new Set(prev)
      next.add(currentSlide)
      next.add((currentSlide + 1) % images.length)
      next.add((currentSlide - 1 + images.length) % images.length)
      return next
    })
  }, [currentSlide, images.length])

  const fetchImages = async () => {
    try {
      const response = await fetch(`${API_URL}/gallery`)

      if (!response.ok) {
        throw new Error('Failed to fetch images')
      }

      const data = await response.json()
      // Filter only active images and sort by sort_order
      const activeImages = (data.data || [])
        .filter((img: GalleryImage) => img.is_active)
        .sort((a: GalleryImage, b: GalleryImage) => a.sort_order - b.sort_order)

      setImages(activeImages)
    } catch (error) {
      console.error('Error fetching images:', error)
      setError('Kunne ikke hente billeder fra galleriet')
      setImages(galleryFallback)
    } finally {
      setIsLoading(false)
    }
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % images.length)
  }

  const previousSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + images.length) % images.length)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const deltaX = e.changedTouches[0].clientX - touchStartX.current
    touchStartX.current = null
    if (Math.abs(deltaX) < 50) return
    if (deltaX < 0) nextSlide()
    else previousSlide()
  }

  const handleCarouselKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') nextSlide()
    if (e.key === 'ArrowLeft') previousSlide()
  }

  const openLightbox = (index: number) => {
    setSelectedImage(index)
    document.body.style.overflow = 'hidden'
  }

  const closeLightbox = () => {
    setSelectedImage(null)
    document.body.style.overflow = 'unset'
  }

  const nextImage = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage + 1) % images.length)
    }
  }

  const previousImage = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage - 1 + images.length) % images.length)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') closeLightbox()
    if (e.key === 'ArrowRight') nextImage()
    if (e.key === 'ArrowLeft') previousImage()
  }

  if (isLoading) {
    return (
      <section id="gallery" className="bg-white">
        <div className="section-container">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">Galleri</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Se billeder fra haven og få et indtryk af de smukke omgivelser
            </p>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="gallery" className="bg-white dark:bg-gray-800 transition-colors">
      <div className="section-container">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">Galleri</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Se billeder fra haven og få et indtryk af de smukke omgivelser
          </p>
        </div>

        {error && (
          <div className="mb-8 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Gallery Carousel */}
        {images.length > 0 && (
          <div
            className="relative max-w-4xl mx-auto"
            role="region"
            aria-label="Billedkarrusel"
            aria-roledescription="karrusel"
            tabIndex={0}
            onKeyDown={handleCarouselKeyDown}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div className="overflow-hidden rounded-xl shadow-md">
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {images.map((image, index) => (
                  <div
                    key={image.id}
                    className="w-full flex-shrink-0 aspect-[4/3] bg-gray-100 dark:bg-gray-700"
                    aria-hidden={index !== currentSlide}
                  >
                    {loadedSlides.has(index) && (
                      <button
                        onClick={() => openLightbox(index)}
                        tabIndex={index === currentSlide ? 0 : -1}
                        className="group relative w-full h-full focus:outline-none focus:ring-4 focus:ring-primary-500"
                        aria-label={`Vis ${image.title} i fuld størrelse`}
                      >
                        <img
                          src={image.thumb_url ?? image.image_url}
                          srcSet={
                            image.thumb_url
                              ? `${image.thumb_url} 960w, ${image.image_url} 1600w`
                              : undefined
                          }
                          sizes="(max-width: 928px) 100vw, 896px"
                          alt={image.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                          <svg
                            className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                            />
                          </svg>
                        </div>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Previous Button */}
            {images.length > 1 && (
              <button
                onClick={previousSlide}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="Forrige billede"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {/* Next Button */}
            {images.length > 1 && (
              <button
                onClick={nextSlide}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="Næste billede"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}

            {/* Caption + position */}
            <p className="text-center mt-4 text-lg text-gray-700 dark:text-gray-300">
              {images[currentSlide].title}{' '}
              <span className="text-gray-400 dark:text-gray-500">
                ({currentSlide + 1} / {images.length})
              </span>
            </p>

            {/* Dot indicators */}
            {images.length > 1 && (
              <div className="flex justify-center gap-2 mt-3">
                {images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2.5 h-2.5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      index === currentSlide
                        ? 'bg-primary-600'
                        : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
                    }`}
                    aria-label={`Gå til billede ${index + 1}`}
                    aria-current={index === currentSlide}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Lightbox */}
        {selectedImage !== null && (
          <div
            ref={lightboxRef}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
            onClick={closeLightbox}
            onKeyDown={handleKeyDown}
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
          >
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-white rounded-lg p-2"
              aria-label="Luk galleri"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Previous Button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                previousImage()
              }}
              className="absolute left-4 text-white hover:text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-white rounded-lg p-2"
              aria-label="Forrige billede"
            >
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Image */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-7xl max-h-[90vh] w-full"
            >
              <img
                src={images[selectedImage].image_url}
                alt={images[selectedImage].title}
                className="w-full h-full object-contain rounded-lg"
              />
              <p className="text-white text-center mt-4 text-lg">
                {images[selectedImage].title} ({selectedImage + 1} / {images.length})
              </p>
            </div>

            {/* Next Button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                nextImage()
              }}
              className="absolute right-4 text-white hover:text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-white rounded-lg p-2"
              aria-label="Næste billede"
            >
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

export default Gallery

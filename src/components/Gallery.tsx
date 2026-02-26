import { useState, useEffect } from 'react'
import { API_URL } from '../config/api'
import { GalleryImage } from '../types'
import { galleryFallback } from '../data/galleryFallback'

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null)
  const [images, setImages] = useState<GalleryImage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchImages()
  }, [])

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

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => openLightbox(index)}
              className="group relative aspect-square overflow-hidden rounded-xl shadow-md hover:shadow-2xl transition-shadow duration-300 focus:outline-none focus:ring-4 focus:ring-primary-500"
            >
              <img
                src={image.image_url}
                alt={image.title}
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
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
          ))}
        </div>

        {/* Lightbox */}
        {selectedImage !== null && (
          <div
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

import { useState, useEffect } from 'react'

interface GalleryImage {
  id: number
  title: string
  description: string | null
  image_url: string
  file_path: string | null
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null)
  const [images, setImages] = useState<GalleryImage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

  useEffect(() => {
    fetchImages()
  }, [])

  const fetchImages = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/gallery`)
      
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
      
      // Fallback to static images if API fails
      setImages([
        {
          id: 1,
          title: 'Telt i naturskønne omgivelser',
          description: null,
          image_url: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
          file_path: null,
          is_active: true,
          sort_order: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 2,
          title: 'Smuk solnedgang i haven',
          description: null,
          image_url: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
          file_path: null,
          is_active: true,
          sort_order: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 3,
          title: 'Cykler parkeret ved haven',
          description: null,
          image_url: 'https://images.unsplash.com/photo-1508873696983-2dfd5898f08b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
          file_path: null,
          is_active: true,
          sort_order: 2,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 4,
          title: 'Morgenkaffe i det fri',
          description: null,
          image_url: 'https://images.unsplash.com/photo-1537905569824-f89f14cceb68?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
          file_path: null,
          is_active: true,
          sort_order: 3,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 5,
          title: 'Blomster i haven',
          description: null,
          image_url: 'https://images.unsplash.com/photo-1445308394109-4ec2920981b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
          file_path: null,
          is_active: true,
          sort_order: 4,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 6,
          title: 'Camping i naturen',
          description: null,
          image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
          file_path: null,
          is_active: true,
          sort_order: 5,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
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
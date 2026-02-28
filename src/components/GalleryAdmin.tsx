import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { API_URL } from '../config/api'

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

const GalleryAdmin: React.FC = () => {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)
  const [draggedItem, setDraggedItem] = useState<number | null>(null)
  const { token } = useAuth()


  useEffect(() => {
    fetchImages()
  }, [])

  const fetchImages = async () => {
    try {
      const response = await fetch(`${API_URL}/gallery/admin`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch images')
      }

      const data = await response.json()
      setImages(data.data || [])
    } catch (error) {
      console.error('Error fetching images:', error)
      setError('Kunne ikke hente billeder')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Er du sikker på, du vil slette dette billede?')) {
      return
    }

    try {
      const response = await fetch(`${API_URL}/gallery/admin/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to delete image')
      }

      setImages(images.filter(img => img.id !== id))
    } catch (error) {
      console.error('Error deleting image:', error)
      setError('Kunne ikke slette billede')
    }
  }

  const handleToggleActive = async (id: number, isActive: boolean) => {
    try {
      const response = await fetch(`${API_URL}/gallery/admin/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ is_active: isActive }),
      })

      if (!response.ok) {
        throw new Error('Failed to update image')
      }

      setImages(images.map(img => 
        img.id === id ? { ...img, is_active: isActive } : img
      ))
    } catch (error) {
      console.error('Error updating image:', error)
      setError('Kunne ikke opdatere billede')
    }
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedItem(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    
    if (draggedItem === null) return

    const draggedImage = images[draggedItem]
    const newImages = [...images]
    newImages.splice(draggedItem, 1)
    newImages.splice(dropIndex, 0, draggedImage)

    // Update sort_order
    const reorderedImages = newImages.map((img, index) => ({
      ...img,
      sort_order: index
    }))

    setImages(reorderedImages)

    try {
      const response = await fetch(`${API_URL}/gallery/admin/reorder`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          imageIds: reorderedImages.map(img => img.id)
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to reorder images')
      }
    } catch (error) {
      console.error('Error reordering images:', error)
      setError('Kunne ikke sortere billeder')
      // Revert on error
      setImages(images)
    }

    setDraggedItem(null)
  }

  const openEditModal = (image: GalleryImage) => {
    setSelectedImage(image)
    setShowEditModal(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Galleri Administration</h2>
            <p className="mt-1 text-sm text-gray-600">
              Administrer billeder i galleriet
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <svg
              className="mr-2 -ml-1 h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Tilføj billede
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Images Grid */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {images.length === 0 ? (
            <li className="px-6 py-4 text-center text-gray-500">
              Ingen billeder fundet
            </li>
          ) : (
            images.map((image, index) => (
              <li
                key={image.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                className="px-6 py-4 hover:bg-gray-50 cursor-move transition-colors"
              >
                <div className="flex items-center space-x-4">
                  {/* Drag handle */}
                  <div className="flex-shrink-0 cursor-grab active:cursor-grabbing">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                  </div>

                  {/* Image thumbnail */}
                  <div className="flex-shrink-0">
                    <img
                      src={image.image_url}
                      alt={image.title}
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                  </div>

                  {/* Image info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {image.title}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {image.description || 'Ingen beskrivelse'}
                    </p>
                    <div className="flex items-center mt-1 space-x-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        image.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {image.is_active ? 'Aktiv' : 'Inaktiv'}
                      </span>
                      <span className="text-xs text-gray-500">
                        Rækkefølge: {image.sort_order}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleActive(image.id, !image.is_active)}
                      className={`p-2 rounded-md text-sm font-medium transition-colors ${
                        image.is_active
                          ? 'text-gray-400 hover:text-yellow-600'
                          : 'text-gray-400 hover:text-green-600'
                      }`}
                      title={image.is_active ? 'Deaktiver' : 'Aktiver'}
                    >
                      {image.is_active ? (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      )}
                    </button>
                    
                    <button
                      onClick={() => openEditModal(image)}
                      className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
                      title="Rediger"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    
                    <button
                      onClick={() => handleDelete(image.id)}
                      className="p-2 text-red-600 hover:text-red-800 transition-colors"
                      title="Slet"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <ImageUploadModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false)
            fetchImages()
          }}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && selectedImage && (
        <ImageEditModal
          image={selectedImage}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            setShowEditModal(false)
            fetchImages()
          }}
        />
      )}
    </div>
  )
}

// Import the modals (we'll create them next)
import ImageUploadModal from './ImageUploadModal'
import ImageEditModal from './ImageEditModal'

export default GalleryAdmin
import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'

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

interface ImageEditModalProps {
  image: GalleryImage
  onClose: () => void
  onSuccess: () => void
}

const ImageEditModal: React.FC<ImageEditModalProps> = ({ image, onClose, onSuccess }) => {
  const [title, setTitle] = useState(image.title)
  const [description, setDescription] = useState(image.description || '')
  const [imageUrl, setImageUrl] = useState(image.image_url)
  const [isActive, setIsActive] = useState(image.is_active)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { token } = useAuth()

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/gallery/admin/${image.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          image_url: imageUrl,
          is_active: isActive,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Opdatering fejlede')
      }

      onSuccess()
    } catch (error) {
      console.error('Update error:', error)
      setError(error instanceof Error ? error.message : 'Opdatering fejlede')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Rediger billede
                </h3>
                <p className="text-sm text-gray-500">
                  Opdater information for billedet
                </p>
              </div>

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              {/* Current image preview */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nuværende billede
                </label>
                <img
                  src={image.image_url}
                  alt={image.title}
                  className="w-full h-48 object-cover rounded-md"
                />
              </div>

              {/* Title */}
              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Titel *
                </label>
                <input
                  type="text"
                  id="title"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Billedets titel"
                />
              </div>

              {/* Description */}
              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Beskrivelse
                </label>
                <textarea
                  id="description"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Kort beskrivelse af billedet"
                />
              </div>

              {/* Image URL */}
              <div className="mb-4">
                <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
                  Billede URL
                </label>
                <input
                  type="url"
                  id="imageUrl"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="https://eksempel.com/billede.jpg"
                />
              </div>

              {/* Active toggle */}
              <div className="mb-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                    Vis billede på hjemmesiden
                  </label>
                </div>
              </div>

              {/* Additional info */}
              <div className="mt-4 p-3 bg-gray-50 rounded-md">
                <p className="text-xs text-gray-500">
                  <strong>Oprettet:</strong> {new Date(image.created_at).toLocaleDateString('da-DK')}<br />
                  <strong>Opdateret:</strong> {new Date(image.updated_at).toLocaleDateString('da-DK')}<br />
                  <strong>Rækkefølge:</strong> {image.sort_order}
                </p>
              </div>
            </div>

            {/* Modal actions */}
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={isLoading || !title}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Opdaterer...
                  </div>
                ) : (
                  'Gem ændringer'
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
              >
                Annuller
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ImageEditModal
import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { API_URL } from '../config/api'

interface Facility {
  id: number
  title: string
  description: string | null
  icon_name: string
  is_active: boolean
  sort_order: number
}

const FacilitiesAdmin: React.FC = () => {
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const { token } = useAuth()

  useEffect(() => {
    fetchFacilities()
  }, [])

  const fetchFacilities = async () => {
    try {
      const response = await fetch(`${API_URL}/facilities/admin`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setFacilities(data.data || [])
    } catch {
      setError('Kunne ikke hente faciliteter')
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggle = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/facilities/admin/${id}/toggle`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (!response.ok) throw new Error('Failed to toggle')
      const data = await response.json()
      setFacilities(facilities.map(f => f.id === id ? data.data : f))
    } catch {
      setError('Kunne ikke opdatere facilitet')
    }
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', String(index))
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'), 10)
    if (dragIndex === dropIndex) return

    const newFacilities = [...facilities]
    const [dragged] = newFacilities.splice(dragIndex, 1)
    newFacilities.splice(dropIndex, 0, dragged)
    setFacilities(newFacilities)

    try {
      const response = await fetch(`${API_URL}/facilities/admin/reorder`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ facilityIds: newFacilities.map(f => f.id) }),
      })
      if (!response.ok) throw new Error('Failed to reorder')
    } catch {
      setError('Kunne ikke sortere faciliteter')
      fetchFacilities()
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Er du sikker på, du vil slette denne facilitet?')) return
    try {
      const response = await fetch(`${API_URL}/facilities/admin/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (!response.ok) throw new Error('Failed to delete')
      setFacilities(facilities.filter(f => f.id !== id))
    } catch {
      setError('Kunne ikke slette facilitet')
    }
  }

  const openEditModal = (facility: Facility) => {
    setEditingFacility(facility)
    setShowModal(true)
  }

  const [showModal, setShowModal] = useState(false)
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Faciliteter Administration</h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Administrer faciliteter der vises på forsiden</p>
          </div>
          <button
            onClick={() => { setEditingFacility(null); setShowModal(true) }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <svg className="mr-2 -ml-1 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Ny facilitet
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {facilities.length === 0 ? (
            <li className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">Ingen faciliteter fundet</li>
          ) : (
            facilities.map((facility, index) => (
              <li
                key={facility.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-move transition-colors"
              >
                <div className="flex items-center space-x-4">
                  {/* Drag handle */}
                  <div className="flex-shrink-0 cursor-grab active:cursor-grabbing">
                    <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{facility.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{facility.description || 'Ingen beskrivelse'}</p>
                    <div className="flex items-center mt-1 space-x-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        facility.is_active ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                      }`}>
                        {facility.is_active ? 'Aktiv' : 'Inaktiv'}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">Ikon: {facility.icon_name}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggle(facility.id)}
                      className={`p-2 rounded-md text-sm font-medium transition-colors ${
                        facility.is_active ? 'text-gray-400 hover:text-yellow-600' : 'text-gray-400 hover:text-green-600'
                      }`}
                      title={facility.is_active ? 'Deaktiver' : 'Aktiver'}
                    >
                      {facility.is_active ? (
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
                      onClick={() => openEditModal(facility)}
                      className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
                      title="Rediger"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>

                    <button
                      onClick={() => handleDelete(facility.id)}
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

      {showModal && (
        <FacilityModal
          facility={editingFacility}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false)
            fetchFacilities()
          }}
          token={token!}
        />
      )}
    </div>
  )
}

// --- FacilityModal ---

interface FacilityModalProps {
  facility: Facility | null
  onClose: () => void
  onSuccess: () => void
  token: string
}

const COMMON_ICONS = [
  'Home', 'Zap', 'UtensilsCrossed', 'Wifi', 'ShieldCheck', 'Moon', 'Users', 'Map',
  'Star', 'Heart', 'Coffee', 'Bike', 'Tent', 'TreePine', 'Droplets', 'Sun',
  'Thermometer', 'Flame', 'Wind', 'Leaf', 'Package', 'Wrench', 'Car', 'Bus',
  'Bath', 'Shower', 'Bed', 'Sofa', 'Tv', 'Music', 'Camera', 'Phone',
]

const FacilityModal: React.FC<FacilityModalProps> = ({ facility, onClose, onSuccess, token }) => {
  const [title, setTitle] = useState(facility?.title || '')
  const [description, setDescription] = useState(facility?.description || '')
  const [selectedIcon, setSelectedIcon] = useState(facility?.icon_name || 'Star')
  const [iconSearch, setIconSearch] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  const filteredIcons = COMMON_ICONS.filter(icon =>
    icon.toLowerCase().includes(iconSearch.toLowerCase())
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !selectedIcon) {
      setError('Titel og ikon er påkrævet')
      return
    }

    setIsSaving(true)
    setError('')

    try {
      const url = facility
        ? `${API_URL}/facilities/admin/${facility.id}`
        : `${API_URL}/facilities/admin`
      const method = facility ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description, icon_name: selectedIcon }),
      })

      if (!response.ok) throw new Error('Failed to save')
      onSuccess()
    } catch {
      setError('Kunne ikke gemme facilitet')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-80" onClick={onClose} />
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {facility ? 'Rediger facilitet' : 'Ny facilitet'}
          </h3>

          {error && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Titel *</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Facilitets titel"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Beskrivelse</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={2}
                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Kort beskrivelse"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ikon *</label>
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center text-primary-600 dark:text-primary-400">
                  <IconPreview name={selectedIcon} />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Valgt: {selectedIcon}</span>
              </div>
              <input
                type="text"
                value={iconSearch}
                onChange={e => setIconSearch(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 mb-2"
                placeholder="Søg ikon..."
              />
              <div className="grid grid-cols-8 gap-1 max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-md p-2 dark:bg-gray-700">
                {filteredIcons.map(icon => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setSelectedIcon(icon)}
                    className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center justify-center ${
                      selectedIcon === icon ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400'
                    }`}
                    title={icon}
                  >
                    <IconPreview name={icon} />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Annuller
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                {isSaving ? 'Gemmer...' : 'Gem'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// Lazy icon renderer using lucide-react
import * as LucideIcons from 'lucide-react'

const IconPreview = ({ name }: { name: string }) => {
  const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[name]
  if (!Icon) return <LucideIcons.Star className="w-5 h-5" />
  return <Icon className="w-5 h-5" />
}

export default FacilitiesAdmin

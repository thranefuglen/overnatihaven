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
        <h2 className="text-2xl font-bold text-gray-900">Faciliteter Administration</h2>
        <p className="mt-1 text-sm text-gray-600">Administrer faciliteter der vises på forsiden</p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {facilities.length === 0 ? (
            <li className="px-6 py-4 text-center text-gray-500">Ingen faciliteter fundet</li>
          ) : (
            facilities.map((facility) => (
              <li key={facility.id} className="px-6 py-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{facility.title}</p>
                    <p className="text-sm text-gray-500">{facility.description || 'Ingen beskrivelse'}</p>
                    <p className="text-xs text-gray-400 mt-1">Ikon: {facility.icon_name}</p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    facility.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {facility.is_active ? 'Aktiv' : 'Inaktiv'}
                  </span>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  )
}

export default FacilitiesAdmin

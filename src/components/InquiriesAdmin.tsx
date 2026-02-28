import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { API_URL } from '../config/api'

interface Inquiry {
  id: number
  name: string
  email: string
  phone: string | null
  arrival_date: string
  departure_date: string
  num_people: number
  message: string | null
  status: 'pending' | 'confirmed' | 'declined' | 'completed'
  created_at: string
  updated_at: string
}

const InquiriesAdmin: React.FC = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const { token } = useAuth()


  useEffect(() => {
    fetchInquiries()
  }, [])

  const fetchInquiries = async () => {
    try {
      const response = await fetch(`${API_URL}/inquiries`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch inquiries')
      }

      const data = await response.json()
      setInquiries(data.data || [])
    } catch (error) {
      console.error('Error fetching inquiries:', error)
      setError('Kunne ikke hente forespørgsler')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusUpdate = async (id: number, status: Inquiry['status']) => {
    try {
      const response = await fetch(`${API_URL}/inquiries/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        throw new Error('Failed to update inquiry')
      }

      setInquiries(inquiries.map(inquiry => 
        inquiry.id === id ? { ...inquiry, status } : inquiry
      ))
    } catch (error) {
      console.error('Error updating inquiry:', error)
      setError('Kunne ikke opdatere forespørgsel')
    }
  }

  const getStatusColor = (status: Inquiry['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'declined':
        return 'bg-red-100 text-red-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: Inquiry['status']) => {
    switch (status) {
      case 'pending':
        return 'Afventer'
      case 'confirmed':
        return 'Bekræftet'
      case 'declined':
        return 'Afvist'
      case 'completed':
        return 'Gennemført'
      default:
        return status
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
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Forespørgsler</h2>
            <p className="mt-1 text-sm text-gray-600">
              Administrer booking forespørgsler
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Inquiries List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {inquiries.length === 0 ? (
            <li className="px-6 py-4 text-center text-gray-500">
              Ingen forespørgsler fundet
            </li>
          ) : (
            inquiries.map((inquiry) => (
              <li key={inquiry.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {inquiry.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {inquiry.email}
                        </p>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(inquiry.status)}`}>
                        {getStatusText(inquiry.status)}
                      </span>
                    </div>
                    
                    <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
                      <div>
                        <span className="font-medium">Ankomst:</span>
                        <p>{new Date(inquiry.arrival_date).toLocaleDateString('da-DK')}</p>
                      </div>
                      <div>
                        <span className="font-medium">Afrejse:</span>
                        <p>{new Date(inquiry.departure_date).toLocaleDateString('da-DK')}</p>
                      </div>
                      <div>
                        <span className="font-medium">Personer:</span>
                        <p>{inquiry.num_people}</p>
                      </div>
                      <div>
                        <span className="font-medium">Telefon:</span>
                        <p>{inquiry.phone || 'Ikke angivet'}</p>
                      </div>
                    </div>
                    
                    {inquiry.message && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Besked:</span> {inquiry.message}
                        </p>
                      </div>
                    )}
                    
                    <div className="mt-2 text-xs text-gray-400">
                      Oprettet: {new Date(inquiry.created_at).toLocaleDateString('da-DK')}
                    </div>
                  </div>
                  
                  <div className="ml-4 flex-shrink-0">
                    <select
                      value={inquiry.status}
                      onChange={(e) => handleStatusUpdate(inquiry.id, e.target.value as Inquiry['status'])}
                      className="text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="pending">Afventer</option>
                      <option value="confirmed">Bekræftet</option>
                      <option value="declined">Afvist</option>
                      <option value="completed">Gennemført</option>
                    </select>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  )
}

export default InquiriesAdmin
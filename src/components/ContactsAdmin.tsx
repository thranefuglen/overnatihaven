import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { API_URL } from '../config/api'

interface Contact {
  id: number
  name: string
  email: string
  subject: string | null
  message: string
  is_read: number
  created_at: string
}

const ContactsAdmin: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const { token } = useAuth()


  useEffect(() => {
    fetchContacts()
  }, [])

  const fetchContacts = async () => {
    try {
      const response = await fetch(`${API_URL}/contacts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch contacts')
      }

      const data = await response.json()
      setContacts(data.data || [])
    } catch (error) {
      console.error('Error fetching contacts:', error)
      setError('Kunne ikke hente beskeder')
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarkAsRead = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/contacts/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ is_read: 1 }),
      })

      if (!response.ok) {
        throw new Error('Failed to update contact')
      }

      setContacts(contacts.map(contact => 
        contact.id === id ? { ...contact, is_read: 1 } : contact
      ))
    } catch (error) {
      console.error('Error updating contact:', error)
      setError('Kunne ikke opdatere besked')
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Er du sikker på, du vil slette denne besked?')) {
      return
    }

    try {
      const response = await fetch(`${API_URL}/contacts/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to delete contact')
      }

      setContacts(contacts.filter(contact => contact.id !== id))
    } catch (error) {
      console.error('Error deleting contact:', error)
      setError('Kunne ikke slette besked')
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
            <h2 className="text-2xl font-bold text-gray-900">Kontaktbeskeder</h2>
            <p className="mt-1 text-sm text-gray-600">
              Administrer beskeder fra kontaktformularen
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Contacts List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {contacts.length === 0 ? (
            <li className="px-6 py-4 text-center text-gray-500">
              Ingen beskeder fundet
            </li>
          ) : (
            contacts.map((contact) => (
              <li key={contact.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {contact.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {contact.email}
                        </p>
                      </div>
                      {contact.is_read === 0 && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Ny
                        </span>
                      )}
                    </div>
                    
                    {contact.subject && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-700">
                          Emne: {contact.subject}
                        </p>
                      </div>
                    )}
                    
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">
                        {contact.message}
                      </p>
                    </div>
                    
                    <div className="mt-2 text-xs text-gray-400">
                      Modtaget: {new Date(contact.created_at).toLocaleDateString('da-DK')} kl. {new Date(contact.created_at).toLocaleTimeString('da-DK')}
                    </div>
                  </div>
                  
                  <div className="ml-4 flex-shrink-0 flex space-x-2">
                    {contact.is_read === 0 && (
                      <button
                        onClick={() => handleMarkAsRead(contact.id)}
                        className="p-2 text-green-600 hover:text-green-800 transition-colors"
                        title="Markér som læst"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleDelete(contact.id)}
                      className="p-2 text-red-600 hover:text-red-800 transition-colors"
                      title="Slet besked"
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
    </div>
  )
}

export default ContactsAdmin
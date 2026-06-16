import React, { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { API_URL } from '../config/api'
import CalendarGrid from './CalendarGrid'
import CalendarLegend from './CalendarLegend'
import {
  computeStatus,
  formatLongDate,
  statusLabel,
  todayISO,
  TOTAL_TENTS,
  type OccupiedDay,
  type SeasonConfig,
} from '../utils/availability'

const DEFAULT_SEASON: SeasonConfig = { season_start: '2026-06-01', season_end: '2026-09-01' }

const CalendarAdmin: React.FC = () => {
  const { token } = useAuth()
  const [season, setSeason] = useState<SeasonConfig>(DEFAULT_SEASON)
  const [occupiedDays, setOccupiedDays] = useState<OccupiedDay[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const now = new Date()
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  // Sæson-form
  const [seasonStart, setSeasonStart] = useState(DEFAULT_SEASON.season_start)
  const [seasonEnd, setSeasonEnd] = useState(DEFAULT_SEASON.season_end)
  const [isSavingSeason, setIsSavingSeason] = useState(false)
  const [seasonSaved, setSeasonSaved] = useState(false)

  useEffect(() => {
    fetchAvailability()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchAvailability = async () => {
    try {
      const response = await fetch(`${API_URL}/availability`)
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      const s: SeasonConfig = data.data?.season ?? DEFAULT_SEASON
      setSeason(s)
      setSeasonStart(s.season_start)
      setSeasonEnd(s.season_end)
      setOccupiedDays(data.data?.days ?? [])
    } catch {
      setError('Kunne ikke hente kalenderen')
    } finally {
      setIsLoading(false)
    }
  }

  const occupiedByDate = useMemo(() => {
    const map: Record<string, OccupiedDay> = {}
    for (const day of occupiedDays) map[day.date] = day
    return map
  }, [occupiedDays])

  const selectedDay: OccupiedDay = selectedDate
    ? occupiedByDate[selectedDate] ?? { date: selectedDate, shelter_occupied: false, tents_occupied: 0 }
    : { date: '', shelter_occupied: false, tents_occupied: 0 }

  const goToPrevMonth = () => {
    setViewMonth((m) => { if (m === 0) { setViewYear((y) => y - 1); return 11 } return m - 1 })
  }
  const goToNextMonth = () => {
    setViewMonth((m) => { if (m === 11) { setViewYear((y) => y + 1); return 0 } return m + 1 })
  }

  // Opdatér lokal state efter et gemt kald
  const applyLocal = (date: string, shelter: boolean, tents: number) => {
    setOccupiedDays((prev) => {
      const rest = prev.filter((d) => d.date !== date)
      if (!shelter && tents === 0) return rest // fuldt ledigt → fjern række
      return [...rest, { date, shelter_occupied: shelter, tents_occupied: tents }]
    })
  }

  const saveDay = async (date: string, shelter: boolean, tents: number) => {
    applyLocal(date, shelter, tents) // optimistisk
    try {
      const response = await fetch(`${API_URL}/availability/${date}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ shelter_occupied: shelter, tents_occupied: tents }),
      })
      if (!response.ok) throw new Error('Failed to save day')
    } catch {
      setError('Kunne ikke gemme dagen')
      fetchAvailability()
    }
  }

  const resetDay = async (date: string) => {
    applyLocal(date, false, 0)
    try {
      const response = await fetch(`${API_URL}/availability/${date}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (!response.ok) throw new Error('Failed to reset day')
    } catch {
      setError('Kunne ikke nulstille dagen')
      fetchAvailability()
    }
  }

  const saveSeason = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingSeason(true)
    setSeasonSaved(false)
    setError('')
    try {
      const response = await fetch(`${API_URL}/availability/season`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ season_start: seasonStart, season_end: seasonEnd }),
      })
      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.message ?? 'Failed to save season')
      }
      const data = await response.json()
      setSeason(data.data)
      setSeasonSaved(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kunne ikke gemme sæson')
    } finally {
      setIsSavingSeason(false)
    }
  }

  const selectedStatus = selectedDate
    ? computeStatus(selectedDate, occupiedByDate[selectedDate], season, todayISO())
    : null

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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Kalender</h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Marker hvilke dage shelteret og teltpladserne er optaget. Urørte dage er ledige.
        </p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Sæson-form */}
      <div className="bg-white dark:bg-gray-800 shadow sm:rounded-md p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Sæson</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Dage uden for sæsonen vises som lukkede for gæsterne.
        </p>
        <form onSubmit={saveSeason} className="flex flex-wrap items-end gap-4">
          <div>
            <label htmlFor="season-start" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start</label>
            <input
              id="season-start"
              type="date"
              value={seasonStart}
              onChange={(e) => { setSeasonStart(e.target.value); setSeasonSaved(false) }}
              className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label htmlFor="season-end" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Slut</label>
            <input
              id="season-end"
              type="date"
              value={seasonEnd}
              onChange={(e) => { setSeasonEnd(e.target.value); setSeasonSaved(false) }}
              className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <button
            type="submit"
            disabled={isSavingSeason}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 disabled:opacity-50"
          >
            {isSavingSeason ? 'Gemmer...' : 'Gem sæson'}
          </button>
          {seasonSaved && <span className="text-sm text-green-600 dark:text-green-400">Gemt ✓</span>}
        </form>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow sm:rounded-md p-6 max-w-2xl">
        <div className="mb-6">
          <CalendarLegend />
        </div>

        <CalendarGrid
          year={viewYear}
          month={viewMonth}
          onPrevMonth={goToPrevMonth}
          onNextMonth={goToNextMonth}
          occupiedByDate={occupiedByDate}
          season={season}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />

        {/* Redigeringsboks for valgt dag */}
        <div className="mt-6 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          {selectedDate && selectedStatus ? (
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white capitalize mb-4">
                {formatLongDate(selectedDate)} — {statusLabel(selectedStatus)}
              </p>

              {/* Shelter */}
              <div className="mb-4">
                <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Shelter</span>
                <div className="inline-flex rounded-md shadow-sm" role="group">
                  <button
                    type="button"
                    onClick={() => saveDay(selectedDate, false, selectedDay.tents_occupied)}
                    className={`px-4 py-2 text-sm font-medium rounded-l-md border ${
                      !selectedDay.shelter_occupied
                        ? 'bg-green-600 text-white border-green-600'
                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    Ledig
                  </button>
                  <button
                    type="button"
                    onClick={() => saveDay(selectedDate, true, selectedDay.tents_occupied)}
                    className={`px-4 py-2 text-sm font-medium rounded-r-md border -ml-px ${
                      selectedDay.shelter_occupied
                        ? 'bg-red-600 text-white border-red-600'
                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    Optaget
                  </button>
                </div>
              </div>

              {/* Teltpladser */}
              <div className="mb-4">
                <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Teltpladser optaget (af {TOTAL_TENTS})
                </span>
                <div className="inline-flex rounded-md shadow-sm" role="group">
                  {[0, 1, 2, 3].map((n, i) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => saveDay(selectedDate, selectedDay.shelter_occupied, n)}
                      className={`px-4 py-2 text-sm font-medium border ${i === 0 ? 'rounded-l-md' : '-ml-px'} ${
                        i === 3 ? 'rounded-r-md' : ''
                      } ${
                        selectedDay.tents_occupied === n
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Genveje */}
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => saveDay(selectedDate, true, TOTAL_TENTS)}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  Luk hele dagen
                </button>
                <button
                  type="button"
                  onClick={() => resetDay(selectedDate)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  Nulstil til ledig
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              Vælg en dag i kalenderen for at redigere den.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default CalendarAdmin

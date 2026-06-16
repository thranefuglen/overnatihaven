import { useState, useEffect, useMemo } from 'react'
import { API_URL } from '../config/api'
import CalendarGrid from './CalendarGrid'
import CalendarLegend from './CalendarLegend'
import {
  computeStatus,
  dayDetail,
  formatLongDate,
  statusLabel,
  todayISO,
  type OccupiedDay,
  type SeasonConfig,
} from '../utils/availability'

const DEFAULT_SEASON: SeasonConfig = { season_start: '2026-06-01', season_end: '2026-09-01' }

const Availability = () => {
  const [season, setSeason] = useState<SeasonConfig>(DEFAULT_SEASON)
  const [occupiedDays, setOccupiedDays] = useState<OccupiedDay[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const now = new Date()
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const response = await fetch(`${API_URL}/availability`)
        if (!response.ok) throw new Error('Failed to fetch availability')
        const data = await response.json()
        setSeason(data.data?.season ?? DEFAULT_SEASON)
        setOccupiedDays(data.data?.days ?? [])
      } catch (err) {
        console.error('Error fetching availability:', err)
        setError('Kunne ikke hente kalenderen lige nu')
      } finally {
        setIsLoading(false)
      }
    }
    fetchAvailability()
  }, [])

  const occupiedByDate = useMemo(() => {
    const map: Record<string, OccupiedDay> = {}
    for (const day of occupiedDays) map[day.date] = day
    return map
  }, [occupiedDays])

  const goToPrevMonth = () => {
    setViewMonth((m) => {
      if (m === 0) { setViewYear((y) => y - 1); return 11 }
      return m - 1
    })
  }
  const goToNextMonth = () => {
    setViewMonth((m) => {
      if (m === 11) { setViewYear((y) => y + 1); return 0 }
      return m + 1
    })
  }

  const selectedStatus = selectedDate
    ? computeStatus(selectedDate, occupiedByDate[selectedDate], season, todayISO())
    : null

  return (
    <section id="availability" className="bg-white dark:bg-gray-900 transition-colors">
      <div className="section-container">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">Ledige dage</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Se hvilke dage der er ledige i sæsonen. Tryk på en dag for at se shelter og teltpladser.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="card p-6 sm:p-8">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              </div>
            ) : error ? (
              <div className="text-center text-gray-600 dark:text-gray-300 py-8">{error}</div>
            ) : (
              <>
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

                {/* Detalje for valgt dag */}
                <div className="mt-6 min-h-[4rem] rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
                  {selectedDate && selectedStatus ? (
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white capitalize">
                        {formatLongDate(selectedDate)} — {statusLabel(selectedStatus)}
                      </p>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                        {dayDetail(selectedStatus, occupiedByDate[selectedDate])}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                      Tryk på en dag for at se ledige pladser.
                    </p>
                  )}
                </div>

                <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-300">
                  Ser du en ledig dag?{' '}
                  <a href="#contact" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
                    Kontakt Elin for at booke
                  </a>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Availability

import {
  buildMonthGrid,
  computeStatus,
  formatMonthTitle,
  parseISODate,
  todayISO,
  WEEKDAY_LABELS,
  type DayStatus,
  type OccupiedDay,
  type SeasonConfig,
} from '../utils/availability'

interface CalendarGridProps {
  year: number
  month: number
  onPrevMonth: () => void
  onNextMonth: () => void
  occupiedByDate: Record<string, OccupiedDay>
  season: SeasonConfig
  selectedDate: string | null
  onSelectDate: (iso: string) => void
}

const STATUS_CELL_CLASSES: Record<DayStatus, string> = {
  available: 'bg-green-100 dark:bg-green-900/40 text-green-900 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-900/60',
  partial: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-900 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-900/60',
  full: 'bg-red-100 dark:bg-red-900/40 text-red-900 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-900/60',
  'out-of-season': 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700',
  past: 'bg-gray-50 dark:bg-gray-800/50 text-gray-300 dark:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700/50',
}

const CalendarGrid: React.FC<CalendarGridProps> = ({
  year,
  month,
  onPrevMonth,
  onNextMonth,
  occupiedByDate,
  season,
  selectedDate,
  onSelectDate,
}) => {
  const today = todayISO()
  const cells = buildMonthGrid(year, month)

  return (
    <div>
      {/* Måneds-navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onPrevMonth}
          aria-label="Forrige måned"
          className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
          {formatMonthTitle(year, month)}
        </h3>
        <button
          onClick={onNextMonth}
          aria-label="Næste måned"
          className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Ugedage */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-1">
            {label}
          </div>
        ))}
      </div>

      {/* Dage */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((iso, idx) => {
          if (iso === null) return <div key={`empty-${idx}`} />
          const status = computeStatus(iso, occupiedByDate[iso], season, today)
          const dayNumber = parseISODate(iso).getDate()
          const isSelected = iso === selectedDate
          return (
            <button
              key={iso}
              onClick={() => onSelectDate(iso)}
              aria-label={iso}
              className={`aspect-square rounded-md text-sm font-medium flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                STATUS_CELL_CLASSES[status]
              } ${isSelected ? 'ring-2 ring-primary-600 dark:ring-primary-400' : ''}`}
            >
              {dayNumber}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default CalendarGrid

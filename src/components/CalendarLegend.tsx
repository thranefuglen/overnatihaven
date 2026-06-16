const LEGEND_ITEMS: { color: string; label: string }[] = [
  { color: 'bg-green-400 dark:bg-green-600', label: 'Alt ledigt' },
  { color: 'bg-yellow-400 dark:bg-yellow-600', label: 'Delvist ledigt' },
  { color: 'bg-red-400 dark:bg-red-600', label: 'Alt optaget' },
  { color: 'bg-gray-300 dark:bg-gray-600', label: 'Uden for sæson' },
]

const CalendarLegend: React.FC = () => (
  <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
    {LEGEND_ITEMS.map((item) => (
      <div key={item.label} className="flex items-center gap-1.5">
        <span className={`inline-block w-3 h-3 rounded-sm ${item.color}`} />
        <span className="text-xs text-gray-600 dark:text-gray-300">{item.label}</span>
      </div>
    ))}
  </div>
)

export default CalendarLegend

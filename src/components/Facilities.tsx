import { useState, useEffect } from 'react'
import * as LucideIcons from 'lucide-react'
import { API_URL } from '../config/api'

interface Facility {
  id: number
  title: string
  description: string | null
  icon_name: string
  is_active: boolean
  sort_order: number
}

const FacilityIcon = ({ iconName }: { iconName: string }) => {
  const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[iconName]
  if (!Icon) return <LucideIcons.Star className="w-8 h-8" />
  return <Icon className="w-8 h-8" />
}

const Facilities = () => {
  const [facilities, setFacilities] = useState<Facility[]>([])

  useEffect(() => {
    fetch(`${API_URL}/facilities`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setFacilities(data.data)
      })
      .catch(console.error)
  }, [])

  return (
    <section id="facilities" className="bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="section-container">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">Faciliteter</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Alt hvad du behøver for en behagelig overnatning efter en lang cykeltur
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {facilities.map((facility) => (
            <div
              key={facility.id}
              className="card p-6 hover:scale-105 transition-transform duration-300"
            >
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center mb-4 text-primary-600 dark:text-primary-400">
                <FacilityIcon iconName={facility.icon_name} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{facility.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{facility.description}</p>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-16 bg-primary-50 dark:bg-primary-900/20 rounded-2xl p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Praktiske Oplysninger</h3>
              <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                <li className="flex items-start">
                  <LucideIcons.Check className="w-6 h-6 text-primary-600 dark:text-primary-400 mr-3 flex-shrink-0" />
                  <span>Check-in fra kl. 15:00, check-out til kl. 11:00</span>
                </li>
                <li className="flex items-start">
                  <LucideIcons.Check className="w-6 h-6 text-primary-600 dark:text-primary-400 mr-3 flex-shrink-0" />
                  <span>Medbring eget telt og soveudstyr</span>
                </li>
                <li className="flex items-start">
                  <LucideIcons.Check className="w-6 h-6 text-primary-600 dark:text-primary-400 mr-3 flex-shrink-0" />
                  <span>Parkering til cykler inkluderet</span>
                </li>
                <li className="flex items-start">
                  <LucideIcons.Check className="w-6 h-6 text-primary-600 dark:text-primary-400 mr-3 flex-shrink-0" />
                  <span>Hund i snor er tilladt</span>
                </li>
                <li className="flex items-start">
                  <LucideIcons.MapPin className="w-6 h-6 text-primary-600 dark:text-primary-400 mr-3 flex-shrink-0" />
                  <span>Haven ligger 1,5 km nord for Gredstedbro, hvor der er togstation, indkøbsmuligheder, pizzeria og hotel med restaurant</span>
                </li>
                <li className="flex items-start">
                  <LucideIcons.Navigation className="w-6 h-6 text-primary-600 dark:text-primary-400 mr-3 flex-shrink-0" />
                  <span>Afstand til Ribe (10 km), Bramming (10 km) og Esbjerg (20 km)</span>
                </li>
                <li className="flex items-start">
                  <LucideIcons.Bike className="w-6 h-6 text-primary-600 dark:text-primary-400 mr-3 flex-shrink-0" />
                  <span>Cykelrute 10 &amp; 11 går næsten lige forbi</span>
                </li>
                <li className="flex items-start">
                  <LucideIcons.AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400 mr-3 flex-shrink-0" />
                  <span>Færdsel i haven er på eget ansvar</span>
                </li>
                <li className="flex items-start">
                  <LucideIcons.AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400 mr-3 flex-shrink-0" />
                  <span>Haven er desværre ikke handicapvenlig</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Husregler</h3>
              <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                <li className="flex items-start">
                  <LucideIcons.Check className="w-6 h-6 text-primary-600 dark:text-primary-400 mr-3 flex-shrink-0" />
                  <span>Respekter naturen og haven</span>
                </li>
                <li className="flex items-start">
                  <LucideIcons.Check className="w-6 h-6 text-primary-600 dark:text-primary-400 mr-3 flex-shrink-0" />
                  <span>Undgå støj efter kl. 22:00</span>
                </li>
                <li className="flex items-start">
                  <LucideIcons.Check className="w-6 h-6 text-primary-600 dark:text-primary-400 mr-3 flex-shrink-0" />
                  <span>Rygning tilladt udendørs, hvor der er askebæger</span>
                </li>
                <li className="flex items-start">
                  <LucideIcons.Check className="w-6 h-6 text-primary-600 dark:text-primary-400 mr-3 flex-shrink-0" />
                  <span>Efterlad haven og faciliteter som du fandt dem</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Facilities

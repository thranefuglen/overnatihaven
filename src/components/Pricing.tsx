import { Tent, Home, BedDouble, Coffee, Egg, Info } from 'lucide-react'

interface SleepOption {
  icon: typeof Tent
  title: string
  description: string
  priceDkk: number
  priceEur: number
  highlighted?: boolean
}

const sleepOptions: SleepOption[] = [
  {
    icon: Tent,
    title: 'I eget telt',
    description: 'Slå dit eget telt op i haven og nyd den friske luft.',
    priceDkk: 50,
    priceEur: 7,
  },
  {
    icon: Home,
    title: 'Ét shelter med god madras',
    description: 'Sov tørt og blødt i shelter på en god madras. Medbring selv sovepose.',
    priceDkk: 60,
    priceEur: 8,
    highlighted: true,
  },
  {
    icon: BedDouble,
    title: 'Ét shelter med opredning',
    description: 'Madras med færdig opredning — dyne, pude og lagner.',
    priceDkk: 80,
    priceEur: 11,
  },
]

const Pricing = () => {
  return (
    <section id="pricing" className="bg-gray-50 dark:bg-gray-800 transition-colors">
      <div className="section-container">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">Priser</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Enkle og overkommelige priser for overnatning
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium">
              <Info className="w-4 h-4" />
              Max 1 overnatning
            </p>
            <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium">
              <Info className="w-4 h-4" />
              Børn under 12 år halv pris
            </p>
          </div>
        </div>

        {/* Basis-pris banner */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-white dark:bg-gray-700 rounded-2xl p-6 md:p-8 shadow-md border-l-4 border-primary-600 dark:border-primary-400">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
              <div className="flex items-baseline gap-2 flex-shrink-0">
                <span className="text-5xl font-bold text-primary-600 dark:text-primary-400">30</span>
                <span className="text-xl text-gray-700 dark:text-gray-200">kr.</span>
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">≈ 4 €</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  Basis: teltplads eller shelter — uden adgang til faciliteter
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Per person / nat. Denne mulighed er den, du finder via UdiNaturen og shelter-appen.
                  Ønsker du adgang til faciliteter, vælg en af mulighederne nedenfor.
                </p>
              </div>
            </div>
          </div>
        </div>

        <h3 className="text-2xl md:text-3xl font-bold text-center text-gray-900 dark:text-white mb-2">
          Med adgang til alle faciliteter
        </h3>
        <p className="text-center text-gray-600 dark:text-gray-300 mb-10">
          Toilet, bad, køkken, el, grill og brænde inkluderet
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {sleepOptions.map((option) => {
            const OptionIcon = option.icon
            return (
              <div
                key={option.title}
                className={`card overflow-hidden hover:scale-105 transition-transform duration-300 flex flex-col ${
                  option.highlighted ? 'ring-2 ring-primary-500 dark:ring-primary-400' : ''
                }`}
              >
                {option.highlighted && (
                  <div className="bg-primary-600 dark:bg-primary-500 text-white text-center py-2 text-sm font-semibold tracking-wide">
                    Populært valg
                  </div>
                )}
                <div className="p-8 flex flex-col flex-1">
                  <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mb-5 mx-auto text-primary-600 dark:text-primary-400">
                    <OptionIcon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-3">{option.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-center text-sm mb-6 flex-1">
                    {option.description}
                  </p>
                  <div className="text-center pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold text-primary-600 dark:text-primary-400">
                        {option.priceDkk}
                      </span>
                      <span className="text-xl text-gray-600 dark:text-gray-300">kr.</span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      ≈ {option.priceEur} € · per person / nat
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Breakfast Add-on */}
        <div className="mt-16 max-w-5xl mx-auto">
          <div className="card overflow-hidden">
            <div className="grid md:grid-cols-5">
              <div className="md:col-span-2 bg-primary-600 dark:bg-primary-700 text-white p-8 md:p-10 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Coffee className="w-6 h-6" />
                  </div>
                  <span className="text-sm uppercase tracking-wider opacity-90">Tilkøb</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-3">Morgenmad</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">50</span>
                  <span className="text-xl">kr.</span>
                </div>
                <p className="text-sm opacity-90 mt-1">≈ 7 € · per person</p>
              </div>
              <div className="md:col-span-3 p-8 md:p-10">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Morgenmaden inkluderer</h4>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  Rugbrød, boller, smør, ost, syltetøj, yoghurt, mysli, juice, kaffe og te — alt du behøver
                  for at komme godt fra start på en ny dag.
                </p>
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400 text-sm">
                  <Egg className="w-5 h-5 flex-shrink-0 text-primary-600 dark:text-primary-400" />
                  <span>Æg og æggekoger til rådighed, så du selv kan koge dem som du vil</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Practical Info */}
        <div className="mt-16 max-w-3xl mx-auto">
          <div className="bg-white dark:bg-gray-700 rounded-2xl p-8 shadow-md">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Betaling</h4>
                <p className="text-gray-600 dark:text-gray-300">Kontant eller MobilePay accepteres</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Afbestilling</h4>
                <p className="text-gray-600 dark:text-gray-300">Gratis afbestilling op til 24 timer før ankomst</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Pricing

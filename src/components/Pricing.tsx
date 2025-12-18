const Pricing = () => {
  return (
    <section id="pricing" className="bg-gray-50">
      <div className="section-container">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">Priser</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Enkle og overkommelige priser for cykelturister
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Single Night */}
          <div className="card hover:scale-105 transition-transform duration-300">
            <div className="p-8">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 text-center mb-2">Enkelt Overnatning</h3>
              <div className="text-center mb-6">
                <span className="text-5xl font-bold text-primary-600">150</span>
                <span className="text-2xl text-gray-600"> kr.</span>
                <p className="text-gray-500 mt-2">per person / nat</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <svg
                    className="w-5 h-5 text-primary-600 mr-3 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Teltplads i haven</span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="w-5 h-5 text-primary-600 mr-3 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Adgang til faciliteter</span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="w-5 h-5 text-primary-600 mr-3 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">WiFi inkluderet</span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="w-5 h-5 text-primary-600 mr-3 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Cykelopbevaring</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Multiple Nights */}
          <div className="card relative hover:scale-105 transition-transform duration-300 border-2 border-primary-500">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <span className="bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Populært valg
              </span>
            </div>
            <div className="p-8">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 text-center mb-2">2-3 Nætter</h3>
              <div className="text-center mb-6">
                <span className="text-5xl font-bold text-primary-600">400</span>
                <span className="text-2xl text-gray-600"> kr.</span>
                <p className="text-gray-500 mt-2">per person / 3 nætter</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <svg
                    className="w-5 h-5 text-primary-600 mr-3 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Alt fra enkelt overnatning</span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="w-5 h-5 text-primary-600 mr-3 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Udvidet køkkenadgang</span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="w-5 h-5 text-primary-600 mr-3 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Fleksible check-in tider</span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="w-5 h-5 text-primary-600 mr-3 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 font-semibold">Spar 50 kr.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Weekly Stay */}
          <div className="card hover:scale-105 transition-transform duration-300">
            <div className="p-8">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 text-center mb-2">Ugentlig Ophold</h3>
              <div className="text-center mb-6">
                <span className="text-5xl font-bold text-primary-600">900</span>
                <span className="text-2xl text-gray-600"> kr.</span>
                <p className="text-gray-500 mt-2">per person / uge</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <svg
                    className="w-5 h-5 text-primary-600 mr-3 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Alt fra tidligere pakker</span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="w-5 h-5 text-primary-600 mr-3 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Fuld køkkenadgang</span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="w-5 h-5 text-primary-600 mr-3 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Vaskerimuligheder</span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="w-5 h-5 text-primary-600 mr-3 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 font-semibold">Bedste værdi</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-2xl p-8 max-w-3xl mx-auto shadow-md">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Ekstra Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Betaling</h4>
                <p className="text-gray-600">Kontant eller MobilePay accepteres</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Afbestilling</h4>
                <p className="text-gray-600">Gratis op til 24 timer før ankomst</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Børn under 12 år</h4>
                <p className="text-gray-600">50% rabat på alle priser</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Grupper (5+ personer)</h4>
                <p className="text-gray-600">Kontakt for specialpris</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Pricing

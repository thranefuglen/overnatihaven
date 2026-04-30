const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-white">
      <div className="section-container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* About */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <svg className="w-8 h-8 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              <span className="text-xl font-bold">Elins Have</span>
            </div>
            <p className="text-gray-400">
              En smuk og fredelig oase for cyklister og vandrere på eventyr gennem Danmark. Kom og overnat i
              naturskønne omgivelser.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Hurtige Links</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#about"
                  className="text-gray-400 hover:text-primary-400 transition-colors"
                  onClick={(e) => {
                    e.preventDefault()
                    document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                >
                  Om Haven
                </a>
              </li>
              <li>
                <a
                  href="#facilities"
                  className="text-gray-400 hover:text-primary-400 transition-colors"
                  onClick={(e) => {
                    e.preventDefault()
                    document.querySelector('#facilities')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                >
                  Faciliteter
                </a>
              </li>
              <li>
                <a
                  href="#gallery"
                  className="text-gray-400 hover:text-primary-400 transition-colors"
                  onClick={(e) => {
                    e.preventDefault()
                    document.querySelector('#gallery')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                >
                  Galleri
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  className="text-gray-400 hover:text-primary-400 transition-colors"
                  onClick={(e) => {
                    e.preventDefault()
                    document.querySelector('#pricing')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                >
                  Priser
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  className="text-gray-400 hover:text-primary-400 transition-colors"
                  onClick={(e) => {
                    e.preventDefault()
                    document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                >
                  Kontakt
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Kontakt</h3>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-start">
                <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <span>+45 51 33 45 75</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span>elinogpalle@bbsyd.dk</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>
                  Mejerivej 3, Gredsted
                  <br />
                  6771 Gredstedbro
                </span>
              </li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Åbningstider</h3>
            <ul className="space-y-2 text-gray-400">
              <li className="flex justify-between">
                <span>Check-in:</span>
                <span className="font-medium text-white">15:00 - 21:00</span>
              </li>
              <li className="flex justify-between">
                <span>Check-out:</span>
                <span className="font-medium text-white">08:00 - 11:00</span>
              </li>
              <li className="pt-4">
                <p className="text-sm">
                  Send gerne en besked, hvis du ankommer uden for disse tider, så finder vi en løsning.
                </p>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8">
          <p className="text-gray-400 text-sm text-center">
            © {currentYear} Elins Have. Alle rettigheder forbeholdes.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

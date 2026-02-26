import LocationMap from './LocationMap'
import PhoneIcon from './icons/PhoneIcon'
import EmailIcon from './icons/EmailIcon'

const Contact = () => {

  return (
    <section id="contact" className="bg-white dark:bg-gray-900 transition-colors">
      <div className="section-container">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">Kontakt Elin</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Har du spørgsmål eller vil du gerne booke? Kontakt mig direkte på telefon eller email
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Call to Action Box */}
          <div className="bg-primary-50 dark:bg-primary-900/20 border-2 border-primary-200 dark:border-primary-700 rounded-2xl p-8 mb-12 text-center">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Klar til at booke?</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
              Ring eller skriv til Elin for at høre om ledige pladser og booke din overnatning.
              Jeg svarer normalt inden for få timer.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:+4512345678"
                className="btn-primary inline-flex items-center justify-center"
              >
                <PhoneIcon className="w-5 h-5 mr-2" />
                Ring til Elin
              </a>
              <a
                href="mailto:elin@overnatihaven.dk"
                className="btn-secondary inline-flex items-center justify-center"
              >
                <EmailIcon className="w-5 h-5 mr-2" />
                Send en email
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Information - Left Side */}
            <div className="card p-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Kontaktoplysninger</h3>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <PhoneIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Telefon</h4>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">+45 12 34 56 78</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Hverdage 9-18, Weekend 10-16</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <EmailIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Email</h4>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">elin@overnatihaven.dk</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Svar inden for 24 timer</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Adresse</h4>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">Ribe</p>
                    <p className="text-gray-600 dark:text-gray-300">6760 Ribe</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Danmark</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map - Right Side */}
            <div className="card overflow-hidden h-full">
              <LocationMap
                address="Ribe"
                city="Ribe"
                postalCode="6760"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Contact

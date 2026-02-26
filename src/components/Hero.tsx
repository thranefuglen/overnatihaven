import { API_BASE_URL } from '../config/api'

const Hero = () => {

  const scrollToContact = () => {
    const element = document.querySelector('#contact')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section id="hero" className="relative min-h-screen flex items-center pt-16 sm:pt-20">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/70 to-primary-800/60 z-10" />
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              `url('${API_BASE_URL}/uploads/gallery/616558711_1268700155074587_3384761009880758784_n.jpg')`,
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-20 section-container text-center text-white">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
          Velkommen til
          <br />
          <span className="text-primary-200">Elins Overnatningshave</span>
        </h1>
        <p className="text-xl sm:text-2xl md:text-3xl mb-8 text-primary-50 max-w-3xl mx-auto">
          En smuk og fredelig oase for cyklister på eventyr
        </p>
        <p className="text-lg sm:text-xl mb-12 text-white/90 max-w-2xl mx-auto">
          Sæt dit telt op i naturskønne omgivelser og nyd en velfortjent pause på din cykeltur gennem
          Danmark
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={scrollToContact} className="btn-primary text-lg px-8 py-4">
            Book Din Overnatning
          </button>
          <a
            href="#about"
            onClick={(e) => {
              e.preventDefault()
              const element = document.querySelector('#about')
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' })
              }
            }}
            className="btn-secondary text-lg px-8 py-4"
          >
            Læs Mere
          </a>
        </div>

        {/* Features */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Naturnær Beliggenhed</h3>
            <p className="text-white/80">Omgivet af smuk natur og grønne områder</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Gode Faciliteter</h3>
            <p className="text-white/80">Alt hvad du behøver for en behagelig overnatning</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Varm Velkomst</h3>
            <p className="text-white/80">Personlig og hjertelig modtagelse fra Elin</p>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </section>
  )
}

export default Hero

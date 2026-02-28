const About = () => {
  return (
    <section id="about" className="bg-white dark:bg-gray-800 transition-colors">
      <div className="section-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Om Elins Have
            </h2>
            <div className="space-y-4 text-lg text-gray-700 dark:text-gray-300">
              <p>
                Velkommen til min smukke have, hvor cyklister kan finde ro og hvile efter en lang dag på
                sadlen. Mit navn er Elin, og jeg elsker at åbne min have for eventyrere på to hjul.
              </p>
              <p>
                Haven er omgivet af naturskønne omgivelser, og der er masser af plads til at sætte dit
                telt op. Jeg har gennem årene haft fornøjelsen af at møde cyklister fra hele verden, og
                hver gang er det en glæde at dele min lille oase med andre naturelskere.
              </p>
              <p>
                Uanset om du er på en lang cykeltur gennem Danmark eller bare har brug for et roligt sted
                at overnatte, er du hjertelig velkommen i min have. Her kan du slappe af, nyde naturen og
                lade batterierne op til næste etape af dit eventyr.
              </p>
            </div>

            {/* Key Features */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <svg
                  className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700 dark:text-gray-300">Rolige omgivelser</span>
              </div>
              <div className="flex items-start space-x-3">
                <svg
                  className="w-6 h-6 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700 dark:text-gray-300">Cykelsikkert område</span>
              </div>
              <div className="flex items-start space-x-3">
                <svg
                  className="w-6 h-6 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700 dark:text-gray-300">Tæt på naturen</span>
              </div>
              <div className="flex items-start space-x-3">
                <svg
                  className="w-6 h-6 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700 dark:text-gray-300">Hjertelig atmosfære</span>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="relative">
            <div className="relative h-[400px] sm:h-[500px] lg:h-[600px] rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://ihslrztuzx2mtoua.public.blob.vercel-storage.com/gallery/1772288751470-le96is.jpeg"
                alt="Udsigt over haven"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Decorative element */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary-200 rounded-full -z-10" />
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-primary-100 rounded-full -z-10" />
          </div>
        </div>
      </div>
    </section>
  )
}

export default About

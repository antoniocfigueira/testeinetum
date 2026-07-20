let globeModule = null
let globeModulePromise = null

function loadCountryGlobe() {
  if (globeModule) return Promise.resolve(globeModule)

  if (!globeModulePromise) {
    globeModulePromise = import('../components/globe/CountryGlobe.jsx')
      .then((loadedModule) => {
        globeModule = loadedModule
        return loadedModule
      })
      .catch((error) => {
        globeModulePromise = null
        throw error
      })
  }

  return globeModulePromise
}

export { loadCountryGlobe }

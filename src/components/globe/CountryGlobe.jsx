import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Globe from 'react-globe.gl'
import { MeshPhongMaterial } from 'three'
import { feature } from 'topojson-client'
import worldAtlas from 'world-atlas/countries-110m.json'
import useElementSize from '../../hooks/useElementSize.js'
import useTheme from '../../hooks/useTheme.js'
import styles from './CountryGlobe.module.css'

const WORLD_FEATURES = feature(
  worldAtlas,
  worldAtlas.objects.countries,
).features

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function getTooltip(country) {
  const flagSource = country.flag.svg || country.flag.png
  const flag = flagSource
    ? `<img src="${escapeHtml(flagSource)}" alt="" />`
    : `<span>${escapeHtml(country.flag.emoji)}</span>`

  return `
    <div class="${styles.tooltip}">
      ${flag}
      <div>
        <strong>${escapeHtml(country.name)}</strong>
        <small>${escapeHtml(country.capital)}</small>
      </div>
    </div>
  `
}

function CountryGlobe({
  countries,
  focusedCountry,
  matchingCountryIds,
  onSelectCountry,
  selectedCountry,
}) {
  const globeRef = useRef(null)
  window.__inetumGlobeRef = globeRef
  const { elementRef, height, width } = useElementSize()
  const { isDark } = useTheme()
  const [hoveredCountryId, setHoveredCountryId] = useState(null)

  const globeMaterial = useMemo(
    () =>
      new MeshPhongMaterial({
        color: isDark ? '#111827' : '#dcecf5',
        shininess: isDark ? 12 : 6,
        specular: isDark ? '#334155' : '#ffffff',
      }),
    [isDark],
  )

  useEffect(() => () => globeMaterial.dispose(), [globeMaterial])

  const { mappedCountries, polygonCountries, pointCountries } = useMemo(() => {
    const countriesByCode = new Map(
      countries
        .filter((country) => country.numericCode)
        .map((country) => [country.numericCode, country]),
    )
    const matchedIds = new Set()
    const polygons = WORLD_FEATURES.flatMap((worldFeature) => {
      const numericCode = String(worldFeature.id).padStart(3, '0')
      const country = countriesByCode.get(numericCode)

      if (!country) return []

      matchedIds.add(country.id)
      return [{ ...worldFeature, country }]
    })
    const points = countries.filter(
      (country) =>
        !matchedIds.has(country.id) && country.coordinates.length === 2,
    )

    return {
      mappedCountries: matchedIds,
      pointCountries: points,
      polygonCountries: polygons,
    }
  }, [countries])

  const isFiltered = matchingCountryIds.size < countries.length
  const isMatch = useCallback(
    (country) => !isFiltered || matchingCountryIds.has(country.id),
    [isFiltered, matchingCountryIds],
  )

  const focusCountry = useCallback((country, duration = 900) => {
    if (!country?.coordinates.length) return

    globeRef.current?.pointOfView(
      {
        altitude: 1.65,
        lat: country.coordinates[0],
        lng: country.coordinates[1],
      },
      duration,
    )
  }, [])

  useEffect(() => {
    if (focusedCountry) focusCountry(focusedCountry)
  }, [focusCountry, focusedCountry])

  const handleGlobeReady = useCallback(() => {
    const controls = globeRef.current?.controls()

    if (!controls) return

    controls.autoRotate = true
    controls.autoRotateSpeed = 0.42
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    globeRef.current.pointOfView({ altitude: 1.95 }, 0)
  }, [])

  const handleHover = useCallback((country) => {
    setHoveredCountryId(country?.id ?? null)

    const controls = globeRef.current?.controls()
    if (controls) controls.autoRotate = !country
  }, [])

  const handleSelect = useCallback(
    (country) => {
      focusCountry(country, 700)
      onSelectCountry(country)
    },
    [focusCountry, onSelectCountry],
  )

  const getCountryColor = useCallback(
    (country) => {
      if (selectedCountry?.id === country.id) return '#0a84ff'
      if (hoveredCountryId === country.id) return '#64d2ff'
      if (!isMatch(country)) {
        return isDark ? 'rgba(72, 72, 74, 0.28)' : 'rgba(174, 174, 178, 0.3)'
      }

      return isDark ? 'rgba(142, 142, 147, 0.68)' : 'rgba(99, 99, 102, 0.5)'
    },
    [hoveredCountryId, isDark, isMatch, selectedCountry],
  )

  return (
    <section className={styles.panel} aria-label="Globo interativo de países">
      <div className={styles.instructions}>
        <span>Globo interativo</span>
        <strong>Arrasta para rodar · scroll para aproximar</strong>
      </div>

      <div className={styles.viewport} ref={elementRef}>
        {width > 0 && height > 0 && (
          <Globe
            animateIn={false}
            atmosphereColor={isDark ? '#0a84ff' : '#64d2ff'}
            atmosphereAltitude={0.13}
            backgroundColor="rgba(0,0,0,0)"
            globeMaterial={globeMaterial}
            height={height}
            onGlobeReady={handleGlobeReady}
            onPointClick={handleSelect}
            onPointHover={handleHover}
            onPolygonClick={({ country }) => handleSelect(country)}
            onPolygonHover={(polygon) => handleHover(polygon?.country)}
            pointAltitude={(country) =>
              selectedCountry?.id === country.id ? 0.075 : 0.035
            }
            pointColor={getCountryColor}
            pointLabel={getTooltip}
            pointLat={(country) => country.coordinates[0]}
            pointLng={(country) => country.coordinates[1]}
            pointRadius={(country) =>
              selectedCountry?.id === country.id ? 0.34 : 0.22
            }
            pointsData={pointCountries}
            pointsMerge={false}
            polygonAltitude={({ country }) => {
              if (selectedCountry?.id === country.id) return 0.035
              if (hoveredCountryId === country.id) return 0.025
              return 0.009
            }}
            polygonCapColor={({ country }) => getCountryColor(country)}
            polygonLabel={({ country }) => getTooltip(country)}
            polygonsData={polygonCountries}
            polygonSideColor={() =>
              isDark ? 'rgba(10, 132, 255, 0.2)' : 'rgba(0, 64, 128, 0.12)'
            }
            polygonStrokeColor={() =>
              isDark ? 'rgba(242, 242, 247, 0.22)' : 'rgba(255, 255, 255, 0.7)'
            }
            polygonsTransitionDuration={260}
            ref={globeRef}
            showAtmosphere
            showGraticules
            waitForGlobeReady={false}
            width={width}
          />
        )}
      </div>

      <div className={styles.mapStatus} aria-live="polite">
        <span>{mappedCountries.size} países com fronteiras</span>
        <span>{pointCountries.length} destinos assinalados</span>
      </div>

      {selectedCountry && (
        <div className={styles.selection}>
          {selectedCountry.flag.svg || selectedCountry.flag.png ? (
            <img
              alt={selectedCountry.flag.alt}
              src={selectedCountry.flag.svg || selectedCountry.flag.png}
            />
          ) : (
            <span aria-hidden="true">{selectedCountry.flag.emoji}</span>
          )}
          <div>
            <small>Destino selecionado</small>
            <strong>{selectedCountry.name}</strong>
          </div>
        </div>
      )}
    </section>
  )
}

export default CountryGlobe

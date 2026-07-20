import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Globe from 'react-globe.gl'
import { MeshStandardMaterial } from 'three'
import { feature } from 'topojson-client'
import worldAtlas from 'world-atlas/countries-110m.json'
import useElementSize from '../../hooks/useElementSize.js'
import useTheme from '../../hooks/useTheme.js'
import styles from './CountryGlobe.module.css'

const WORLD_FEATURES = feature(
  worldAtlas,
  worldAtlas.objects.countries,
).features
const WORLD_FEATURES_BY_CODE = new Map(
  WORLD_FEATURES.map((worldFeature) => [
    String(worldFeature.id).padStart(3, '0'),
    worldFeature,
  ]),
)
const RENDERER_CONFIG = {
  alpha: true,
  antialias: false,
  powerPreference: 'high-performance',
  precision: 'highp',
}

const COUNTRY_COLORS = {
  dark: [
    'rgba(116, 126, 142, 0.72)',
    'rgba(132, 143, 158, 0.7)',
    'rgba(103, 116, 134, 0.74)',
  ],
  light: [
    'rgba(91, 102, 111, 0.55)',
    'rgba(112, 121, 129, 0.5)',
    'rgba(76, 91, 103, 0.56)',
  ],
}

function getCountryBaseColor(country, isDark) {
  const colors = COUNTRY_COLORS[isDark ? 'dark' : 'light']
  const colorIndex = (Number(country.numericCode) || country.name.length) % colors.length

  return colors[colorIndex]
}

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
  isActive,
  matchingCountryIds,
  onSelectCountry,
  selectedCountry,
}) {
  const globeRef = useRef(null)
  const idleTimerRef = useRef(null)
  const lastPointerWakeRef = useRef(0)
  const { elementRef, height, width } = useElementSize()
  const { isDark } = useTheme()
  const [hoveredCountryId, setHoveredCountryId] = useState(null)
  const [isDocumentVisible, setIsDocumentVisible] = useState(
    () => document.visibilityState === 'visible',
  )
  const [isInViewport, setIsInViewport] = useState(true)
  const shouldAnimate = isActive && isDocumentVisible && isInViewport

  const globeMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: isDark ? '#111318' : '#dce5ea',
        metalness: 0,
        roughness: 0.94,
      }),
    [isDark],
  )

  useEffect(() => () => globeMaterial.dispose(), [globeMaterial])

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsDocumentVisible(document.visibilityState === 'visible')
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  useEffect(() => {
    const element = elementRef.current

    if (!element) return undefined

    const observer = new IntersectionObserver(
      ([entry]) => setIsInViewport(entry.isIntersecting),
      { threshold: 0.05 },
    )
    observer.observe(element)

    return () => observer.disconnect()
  }, [elementRef])

  const { mappedCountries, polygonCountries } = useMemo(() => {
    const countriesByCode = new Map(
      countries
        .filter((country) => country.numericCode)
        .map((country) => [country.numericCode, country]),
    )
    const matchedIds = new Set()
    const polygons = [...countriesByCode].flatMap(([numericCode, country]) => {
      const worldFeature = WORLD_FEATURES_BY_CODE.get(numericCode)

      if (!worldFeature) return []

      matchedIds.add(country.id)
      return [{ ...worldFeature, country }]
    })
    return {
      mappedCountries: matchedIds,
      polygonCountries: polygons,
    }
  }, [countries])

  const isFiltered = matchingCountryIds.size < countries.length
  const isMatch = useCallback(
    (country) => !isFiltered || matchingCountryIds.has(country.id),
    [isFiltered, matchingCountryIds],
  )

  const pauseGlobe = useCallback(() => {
    window.clearTimeout(idleTimerRef.current)
    idleTimerRef.current = null

    const globe = globeRef.current
    const controls = globe?.controls()

    if (controls) controls.autoRotate = false
    globe?.pauseAnimation()
  }, [])

  const wakeGlobe = useCallback(
    (idleDelay = 2200, autoRotate = false) => {
      if (!shouldAnimate) return

      const globe = globeRef.current
      const controls = globe?.controls()

      if (!globe) return

      window.clearTimeout(idleTimerRef.current)
      globe.resumeAnimation()
      if (controls) controls.autoRotate = autoRotate
      idleTimerRef.current = window.setTimeout(pauseGlobe, idleDelay)
    },
    [pauseGlobe, shouldAnimate],
  )

  const focusCountry = useCallback(
    (country, duration = 900) => {
      if (!country?.coordinates.length) return

      wakeGlobe(duration + 500)
      globeRef.current?.pointOfView(
        {
          altitude: 1.65,
          lat: country.coordinates[0],
          lng: country.coordinates[1],
        },
        duration,
      )
    },
    [wakeGlobe],
  )

  useEffect(() => {
    if (focusedCountry) focusCountry(focusedCountry)
  }, [focusCountry, focusedCountry])

  useEffect(() => {
    if (shouldAnimate) wakeGlobe(6000, true)
    else pauseGlobe()

    return () => window.clearTimeout(idleTimerRef.current)
  }, [pauseGlobe, shouldAnimate, wakeGlobe])

  const handleGlobeReady = useCallback(() => {
    const controls = globeRef.current?.controls()
    const renderer = globeRef.current?.renderer()

    renderer?.setPixelRatio(1)

    if (!controls) return

    controls.autoRotateSpeed = 0.42
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    globeRef.current.pointOfView({ altitude: width < 700 ? 1.45 : 1.2 }, 0)

    if (shouldAnimate) wakeGlobe(6000, true)
    else pauseGlobe()
  }, [pauseGlobe, shouldAnimate, wakeGlobe, width])

  const handleHover = useCallback((country) => {
    const nextCountryId = country?.id ?? null

    setHoveredCountryId((currentCountryId) =>
      currentCountryId === nextCountryId ? currentCountryId : nextCountryId,
    )
    wakeGlobe(country ? 1800 : 900)

    const controls = globeRef.current?.controls()
    if (controls) controls.autoRotate = false
  }, [wakeGlobe])
  const handlePointerMove = useCallback(() => {
    const currentTime = performance.now()

    if (currentTime - lastPointerWakeRef.current < 180) return

    lastPointerWakeRef.current = currentTime
    wakeGlobe(900)
  }, [wakeGlobe])

  const handleSelect = useCallback(
    (country, coordinates) => {
      const globe = globeRef.current
      const canvas = globe?.renderer()?.domElement
      const tooltip = elementRef.current?.querySelector(`.${styles.tooltip}`)
      const tooltipBounds = tooltip?.getBoundingClientRect()
      const screenPosition = coordinates
        ? globe?.getScreenCoords(
            coordinates.lat,
            coordinates.lng,
            coordinates.altitude,
          )
        : null
      let origin = null

      if (tooltipBounds?.width && tooltipBounds?.height) {
        origin = {
          height: tooltipBounds.height,
          width: tooltipBounds.width,
          x: tooltipBounds.left + tooltipBounds.width / 2,
          y: tooltipBounds.top + tooltipBounds.height / 2,
        }
      } else if (canvas && screenPosition) {
        const bounds = canvas.getBoundingClientRect()
        const scaleX = bounds.width / width
        const scaleY = bounds.height / height

        origin = {
          height: 26,
          width: 36,
          x: bounds.left + screenPosition.x * scaleX,
          y: bounds.top + screenPosition.y * scaleY,
        }
      }

      focusCountry(country, 700)
      onSelectCountry(country, origin)
    },
    [elementRef, focusCountry, height, onSelectCountry, width],
  )

  const getCountryColor = useCallback(
    (country) => {
      if (selectedCountry?.id === country.id) return '#0a84ff'
      if (hoveredCountryId === country.id) return '#64d2ff'
      if (!isMatch(country)) {
        return isDark ? 'rgba(72, 72, 74, 0.28)' : 'rgba(174, 174, 178, 0.3)'
      }

      return getCountryBaseColor(country, isDark)
    },
    [hoveredCountryId, isDark, isMatch, selectedCountry],
  )
  const handlePolygonClick = useCallback(
    ({ country }, _event, coordinates) => handleSelect(country, coordinates),
    [handleSelect],
  )
  const handlePolygonHover = useCallback(
    (polygon) => handleHover(polygon?.country),
    [handleHover],
  )
  const getPolygonAltitude = useCallback(
    ({ country }) => {
      if (selectedCountry?.id === country.id) return 0.022
      if (hoveredCountryId === country.id) return 0.016
      return 0.006
    },
    [hoveredCountryId, selectedCountry],
  )
  const getPolygonCapColor = useCallback(
    ({ country }) => getCountryColor(country),
    [getCountryColor],
  )
  const getPolygonLabel = useCallback(
    ({ country }) => getTooltip(country),
    [],
  )
  const getPolygonSideColor = useCallback(
    () =>
      isDark ? 'rgba(10, 132, 255, 0.2)' : 'rgba(0, 64, 128, 0.12)',
    [isDark],
  )

  return (
    <section className={styles.panel} aria-label="Globo interativo de países">
      <div className={styles.instructions}>
        <span>Globo interativo</span>
        <strong>Arrasta para rodar · scroll para aproximar</strong>
      </div>

      <div
        className={styles.viewport}
        onPointerDown={() => wakeGlobe(10000)}
        onPointerMove={handlePointerMove}
        onPointerUp={() => wakeGlobe(1800)}
        onWheel={() => wakeGlobe(1800)}
        ref={elementRef}
      >
        {width > 0 && height > 0 && (
          <Globe
            animateIn={false}
            backgroundColor="rgba(0,0,0,0)"
            globeCurvatureResolution={10}
            globeMaterial={globeMaterial}
            height={height}
            onGlobeReady={handleGlobeReady}
            onPolygonClick={handlePolygonClick}
            onPolygonHover={handlePolygonHover}
            polygonAltitude={getPolygonAltitude}
            polygonCapCurvatureResolution={5}
            polygonCapColor={getPolygonCapColor}
            polygonLabel={getPolygonLabel}
            polygonsData={polygonCountries}
            polygonSideColor={getPolygonSideColor}
            polygonsTransitionDuration={0}
            ref={globeRef}
            rendererConfig={RENDERER_CONFIG}
            showAtmosphere={false}
            showGraticules
            waitForGlobeReady={false}
            width={width}
          />
        )}
      </div>

      <div className={styles.mapStatus} aria-live="polite">
        <span>{mappedCountries.size} países com fronteiras</span>
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

export default memo(CountryGlobe)

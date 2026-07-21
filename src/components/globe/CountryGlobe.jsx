import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { geoContains } from 'd3-geo'
import { ChevronRight } from 'lucide-react'
import Globe from 'react-globe.gl'
import { MeshStandardMaterial, ShaderMaterial, Vector3 } from 'three'
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
    'rgba(142, 142, 147, 0.72)',
    'rgba(174, 174, 178, 0.7)',
    'rgba(120, 120, 125, 0.74)',
  ],
  light: [
    'rgba(99, 99, 102, 0.55)',
    'rgba(142, 142, 147, 0.5)',
    'rgba(72, 72, 74, 0.56)',
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
  const aimCardRef = useRef(null)
  const aimTimerRef = useRef(null)
  const idleTimerRef = useRef(null)
  const lastPointerWakeRef = useRef(0)
  const { elementRef, height, width } = useElementSize()
  const { isDark } = useTheme()
  const [hoveredCountryId, setHoveredCountryId] = useState(null)
  const [aimedCountry, setAimedCountry] = useState(null)
  const [isEdgeBlurActive, setIsEdgeBlurActive] = useState(false)
  const [isDocumentVisible, setIsDocumentVisible] = useState(
    () => document.visibilityState === 'visible',
  )
  const [isInViewport, setIsInViewport] = useState(true)
  const shouldAnimate = isActive && isDocumentVisible && isInViewport
  const mobileGlobeSize = Math.min(width, height)
  const globeWidth = width < 700 ? mobileGlobeSize : width
  const globeHeight = width < 700 ? mobileGlobeSize : height

  const globeMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: isDark ? '#171719' : '#d1d1d6',
        metalness: 0,
        roughness: 0.94,
      }),
    [isDark],
  )
  const hoveredCountryMaterial = useMemo(
    () =>
      new ShaderMaterial({
        depthWrite: true,
        fragmentShader: `
          uniform vec3 gradientAxis;
          uniform float gradientCenter;
          varying vec3 vWorldPosition;

          void main() {
            vec3 appleBlue = vec3(0.0, 0.443137, 0.890196);
            vec3 lowerBlue = appleBlue * 0.86;
            vec3 upperBlue = mix(appleBlue, vec3(1.0), 0.22);
            float localPosition = dot(normalize(vWorldPosition), gradientAxis) - gradientCenter;
            float verticalGradient = 0.5 + atan(localPosition * 6.0) / 3.14159265;
            vec3 gradientColor = mix(lowerBlue, upperBlue, verticalGradient);

            gl_FragColor = vec4(gradientColor, 0.82);
          }
        `,
        transparent: true,
        uniforms: {
          gradientAxis: { value: new Vector3(0, 1, 0) },
          gradientCenter: { value: 0 },
        },
        vertexShader: `
          varying vec3 vWorldPosition;

          void main() {
            vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
      }),
    [],
  )

  useEffect(() => () => globeMaterial.dispose(), [globeMaterial])
  useEffect(
    () => () => hoveredCountryMaterial.dispose(),
    [hoveredCountryMaterial],
  )

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

  useEffect(() => {
    const hoveredPolygon = polygonCountries.find(
      ({ country }) => country.id === hoveredCountryId,
    )
    const coordinates = hoveredPolygon?.country.coordinates
    const globe = globeRef.current

    if (!coordinates?.length || !globe) return

    const [latitude, longitude] = coordinates
    const center = globe.getCoords(latitude, longitude, 0)
    const north = globe.getCoords(Math.min(latitude + 1, 89.9), longitude, 0)
    const centerVector = new Vector3(center.x, center.y, center.z).normalize()
    const gradientAxis = new Vector3(
      north.x - center.x,
      north.y - center.y,
      north.z - center.z,
    ).normalize()

    hoveredCountryMaterial.uniforms.gradientAxis.value.copy(gradientAxis)
    hoveredCountryMaterial.uniforms.gradientCenter.value =
      centerVector.dot(gradientAxis)
    hoveredCountryMaterial.uniformsNeedUpdate = true
  }, [hoveredCountryId, hoveredCountryMaterial, polygonCountries])

  const updateAimedCountry = useCallback(() => {
    if (width >= 700) return

    const coordinates = globeRef.current?.toGlobeCoords(
      globeWidth / 2,
      globeHeight / 2,
    )
    const aimedPolygon = coordinates
      ? polygonCountries.find((polygon) =>
          geoContains(polygon, [coordinates.lng, coordinates.lat]),
        )
      : null
    const nextCountry = aimedPolygon?.country ?? null

    setAimedCountry((currentCountry) =>
      currentCountry?.id === nextCountry?.id ? currentCountry : nextCountry,
    )
    setHoveredCountryId((currentCountryId) =>
      currentCountryId === nextCountry?.id
        ? currentCountryId
        : nextCountry?.id ?? null,
    )
  }, [globeHeight, globeWidth, polygonCountries, width])

  const scheduleAimUpdate = useCallback(() => {
    if (width >= 700 || aimTimerRef.current) return

    aimTimerRef.current = window.setTimeout(() => {
      aimTimerRef.current = null
      updateAimedCountry()
    }, 110)
  }, [updateAimedCountry, width])

  const handleZoom = useCallback(
    (pointOfView) => {
      scheduleAimUpdate()

      const altitude = Number(
        pointOfView?.altitude ?? globeRef.current?.pointOfView()?.altitude,
      )
      const shouldBlurEdges = Number.isFinite(altitude) && altitude < 0.96
      setIsEdgeBlurActive((currentValue) =>
        currentValue === shouldBlurEdges ? currentValue : shouldBlurEdges,
      )
    },
    [scheduleAimUpdate],
  )

  useEffect(() => {
    scheduleAimUpdate()

    return () => {
      window.clearTimeout(aimTimerRef.current)
      aimTimerRef.current = null
    }
  }, [scheduleAimUpdate])

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
      idleTimerRef.current = window.setTimeout(() => {
        if (autoRotate && controls) {
          controls.autoRotate = false
          idleTimerRef.current = window.setTimeout(pauseGlobe, 1000)
          return
        }

        pauseGlobe()
      }, idleDelay)
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
    scheduleAimUpdate()

    if (shouldAnimate) wakeGlobe(6000, true)
    else pauseGlobe()
  }, [pauseGlobe, scheduleAimUpdate, shouldAnimate, wakeGlobe, width])

  const handleHover = useCallback((country) => {
    if (width < 700) return

    const nextCountryId = country?.id ?? null

    setHoveredCountryId((currentCountryId) =>
      currentCountryId === nextCountryId ? currentCountryId : nextCountryId,
    )
    wakeGlobe(country ? 1800 : 1000, !country)
  }, [wakeGlobe, width])
  const handlePointerMove = useCallback(() => {
    const currentTime = performance.now()

    if (currentTime - lastPointerWakeRef.current < 180) return

    lastPointerWakeRef.current = currentTime
    wakeGlobe(1200)
    scheduleAimUpdate()
  }, [scheduleAimUpdate, wakeGlobe])
  const handlePointerLeave = useCallback(() => {
    if (width < 700) return

    wakeGlobe(1000, true)
  }, [wakeGlobe, width])

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
        const scaleX = bounds.width / globeWidth
        const scaleY = bounds.height / globeHeight

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
    [elementRef, focusCountry, globeHeight, globeWidth, onSelectCountry],
  )
  const handleAimCardSelect = useCallback(() => {
    if (!aimedCountry) return

    const bounds = aimCardRef.current?.getBoundingClientRect()
    const origin = bounds
      ? {
          height: bounds.height,
          width: bounds.width,
          x: bounds.left + bounds.width / 2,
          y: bounds.top + bounds.height / 2,
        }
      : null

    focusCountry(aimedCountry, 700)
    onSelectCountry(aimedCountry, origin)
  }, [aimedCountry, focusCountry, onSelectCountry])

  const getCountryColor = useCallback(
    (country) => {
      if (selectedCountry?.id === country.id) {
        return isDark ? '#f2f2f7' : '#1c1c1e'
      }
      if (hoveredCountryId === country.id) {
        return isDark ? '#d1d1d6' : '#636366'
      }
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
  const getPolygonCapMaterial = useCallback(
    ({ country }) =>
      hoveredCountryId === country.id && selectedCountry?.id !== country.id
        ? hoveredCountryMaterial
        : undefined,
    [hoveredCountryId, hoveredCountryMaterial, selectedCountry],
  )
  const getPolygonLabel = useCallback(
    ({ country }) => (width < 700 ? '' : getTooltip(country)),
    [width],
  )
  const getPolygonSideColor = useCallback(
    ({ country }) => {
      if (hoveredCountryId === country.id) {
        return 'rgba(62, 151, 240, 0.72)'
      }

      return isDark
        ? 'rgba(242, 242, 247, 0.12)'
        : 'rgba(28, 28, 30, 0.1)'
    },
    [hoveredCountryId, isDark],
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
        onPointerLeave={handlePointerLeave}
        onPointerMove={handlePointerMove}
        onPointerUp={() => {
          wakeGlobe(1800)
          scheduleAimUpdate()
        }}
        onWheel={() => wakeGlobe(1800)}
        ref={elementRef}
      >
        {globeWidth > 0 && globeHeight > 0 && (
          <div className={styles.globeStage}>
            <Globe
              animateIn={false}
              backgroundColor="rgba(0,0,0,0)"
              globeCurvatureResolution={10}
              globeMaterial={globeMaterial}
              height={globeHeight}
              onGlobeReady={handleGlobeReady}
              onZoom={handleZoom}
              onPolygonClick={handlePolygonClick}
              onPolygonHover={handlePolygonHover}
              polygonAltitude={getPolygonAltitude}
              polygonCapCurvatureResolution={5}
              polygonCapColor={getPolygonCapColor}
              polygonCapMaterial={getPolygonCapMaterial}
              polygonLabel={getPolygonLabel}
              polygonsData={polygonCountries}
              polygonSideColor={getPolygonSideColor}
              polygonsTransitionDuration={0}
              ref={globeRef}
              rendererConfig={RENDERER_CONFIG}
              showAtmosphere={false}
              waitForGlobeReady={false}
              width={globeWidth}
            />
          </div>
        )}

        {isEdgeBlurActive && (
          <div className={styles.edgeBlur} aria-hidden="true">
            <span className={styles.edgeBlurTop} />
            <span className={styles.edgeBlurRight} />
            <span className={styles.edgeBlurBottom} />
            <span className={styles.edgeBlurLeft} />
          </div>
        )}

        <div className={styles.mobileAim} aria-hidden="true">
          <span />
        </div>

        {aimedCountry && (
          <button
            aria-label={`Abrir informações sobre ${aimedCountry.name}`}
            className={styles.aimCard}
            key={aimedCountry.id}
            onClick={handleAimCardSelect}
            onPointerDown={(event) => event.stopPropagation()}
            onPointerUp={(event) => event.stopPropagation()}
            ref={aimCardRef}
            type="button"
          >
            {aimedCountry.flag.svg || aimedCountry.flag.png ? (
              <img
                alt=""
                src={aimedCountry.flag.svg || aimedCountry.flag.png}
              />
            ) : (
              <span>{aimedCountry.flag.emoji}</span>
            )}
            <div>
              <small>Na mira</small>
              <strong>{aimedCountry.name}</strong>
            </div>
            <ChevronRight
              aria-hidden="true"
              className={styles.aimCardIndicator}
              size={18}
              strokeWidth={2.2}
            />
          </button>
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

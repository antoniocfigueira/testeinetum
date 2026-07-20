import { ArrowLeft, ArrowRight, Shuffle } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import useAuth from '../../hooks/useAuth.js'
import useFavorites from '../../hooks/useFavorites.js'
import useLoginPrompt from '../../hooks/useLoginPrompt.js'
import CountryCard from './CountryCard.jsx'
import styles from './MobileCountryDeck.module.css'

const STACK_SIZE = 4
const SWIPE_THRESHOLD = 82

function shuffleCountries(countries) {
  const shuffledCountries = [...countries]

  for (let index = shuffledCountries.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    const currentCountry = shuffledCountries[index]

    shuffledCountries[index] = shuffledCountries[randomIndex]
    shuffledCountries[randomIndex] = currentCountry
  }

  return shuffledCountries
}

function createStack(countries) {
  return shuffleCountries(countries).slice(0, Math.min(STACK_SIZE, countries.length))
}

function MobileCountryDeck({ countries, onSelectCountry }) {
  const { isAuthenticated } = useAuth()
  const { isFavorite, toggleFavorite } = useFavorites()
  const { openLoginPrompt } = useLoginPrompt()
  const [deckCountries, setDeckCountries] = useState(() => createStack(countries))
  const [drag, setDrag] = useState({ isActive: false, x: 0, y: 0 })
  const [exitDirection, setExitDirection] = useState(null)
  const dragStartRef = useRef(null)
  const didDragRef = useRef(false)
  const exitTimerRef = useRef(null)

  const countryIds = useMemo(
    () => countries.map((country) => country.id).join('|'),
    [countries],
  )

  useEffect(() => {
    setDeckCountries(createStack(countries))
    setDrag({ isActive: false, x: 0, y: 0 })
    setExitDirection(null)
  }, [countries, countryIds])

  useEffect(
    () => () => window.clearTimeout(exitTimerRef.current),
    [],
  )

  const handleToggleFavorite = (country) => {
    if (!isAuthenticated) {
      openLoginPrompt('favorites')
      return
    }

    toggleFavorite(country)
  }

  const advanceDeck = () => {
    setDeckCountries((currentDeck) => {
      if (!currentDeck.length) return createStack(countries)

      const remainingCountries = currentDeck.slice(1)
      const remainingIds = new Set(remainingCountries.map((country) => country.id))
      const dismissedCountryId = currentDeck[0].id
      let candidates = countries.filter(
        (country) =>
          !remainingIds.has(country.id) && country.id !== dismissedCountryId,
      )

      if (!candidates.length) {
        candidates = countries.filter((country) => !remainingIds.has(country.id))
      }

      const nextCountry = candidates.length
        ? candidates[Math.floor(Math.random() * candidates.length)]
        : null

      return nextCountry
        ? [...remainingCountries, nextCountry]
        : remainingCountries.length
          ? remainingCountries
          : createStack(countries)
    })
  }

  const dismissTopCard = (direction) => {
    if (exitDirection || !deckCountries.length) return

    setExitDirection(direction)
    exitTimerRef.current = window.setTimeout(() => {
      advanceDeck()
      setExitDirection(null)
      setDrag({ isActive: false, x: 0, y: 0 })
    }, 280)
  }

  const handlePointerDown = (event) => {
    if (event.button !== 0 || exitDirection) return

    event.currentTarget.setPointerCapture(event.pointerId)
    dragStartRef.current = { x: event.clientX, y: event.clientY }
    didDragRef.current = false
    setDrag({ isActive: true, x: 0, y: 0 })
  }

  const handlePointerMove = (event) => {
    if (!dragStartRef.current || exitDirection) return

    const x = event.clientX - dragStartRef.current.x
    const y = event.clientY - dragStartRef.current.y

    if (Math.abs(x) > 6) didDragRef.current = true
    setDrag({ isActive: true, x, y: y * 0.2 })
  }

  const finishPointerGesture = (event) => {
    if (!dragStartRef.current) return

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }

    dragStartRef.current = null

    if (Math.abs(drag.x) >= SWIPE_THRESHOLD) {
      dismissTopCard(drag.x < 0 ? 'left' : 'right')
      return
    }

    setDrag({ isActive: false, x: 0, y: 0 })
    window.setTimeout(() => {
      didDragRef.current = false
    }, 0)
  }

  if (!deckCountries.length) return null

  return (
    <section className={styles.deckSection} aria-label="Sugestões de países">
      <div className={styles.deckHint}>
        <span><ArrowLeft size={15} /> Desliza</span>
        <strong>Descobre ao teu ritmo</strong>
        <span>Desliza <ArrowRight size={15} /></span>
      </div>

      <div className={styles.deckViewport}>
        {deckCountries.map((country, index) => {
          const isTopCard = index === 0
          const rotation = [0, -3.4, 2.8, -1.8][index] ?? 0
          const layerStyle = {
            '--drag-rotation': `${drag.x / 18}deg`,
            '--drag-x': `${drag.x}px`,
            '--drag-y': `${drag.y}px`,
            '--stack-blur': `${index * 0.65}px`,
            '--stack-opacity': 1 - index * 0.09,
            '--stack-rotation': `${rotation}deg`,
            '--stack-scale': 1 - index * 0.035,
            '--stack-y': `${index * 13}px`,
            zIndex: STACK_SIZE - index,
          }

          return (
            <div
              className={`${styles.cardLayer} ${isTopCard ? styles.topCard : ''} ${isTopCard && drag.isActive ? styles.dragging : ''} ${isTopCard && exitDirection ? styles[`exit${exitDirection}`] : ''}`}
              key={country.id}
              onClickCapture={(event) => {
                if (!didDragRef.current) return
                event.preventDefault()
                event.stopPropagation()
              }}
              onPointerCancel={isTopCard ? finishPointerGesture : undefined}
              onPointerDown={isTopCard ? handlePointerDown : undefined}
              onPointerMove={isTopCard ? handlePointerMove : undefined}
              onPointerUp={isTopCard ? finishPointerGesture : undefined}
              style={layerStyle}
            >
              <CountryCard
                country={country}
                isFavorite={isFavorite(country.id)}
                onSelect={onSelectCountry}
                onToggleFavorite={handleToggleFavorite}
              />
            </div>
          )
        })}
      </div>

      <div className={styles.deckActions}>
        <button onClick={() => dismissTopCard('left')} type="button">
          <Shuffle size={18} />
          Outra sugestão
        </button>
        <button onClick={() => onSelectCountry(deckCountries[0])} type="button">
          Ver {deckCountries[0].name}
          <ArrowRight size={18} />
        </button>
      </div>
    </section>
  )
}

export default MobileCountryDeck

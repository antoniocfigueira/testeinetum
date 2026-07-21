import { useEffect, useRef } from 'react'
import styles from './InteractiveNetworkBackground.module.css'

const POINTER_RADIUS = 220
const NODE_HUES = [205, 214, 259, 166]

function createNetwork(width, height) {
  const area = width * height
  const targetCount = Math.min(106, Math.max(38, Math.round(area / 21000)))
  const columns = Math.max(
    4,
    Math.round(Math.sqrt(targetCount * Math.max(0.7, width / height))),
  )
  const rows = Math.ceil(targetCount / columns)
  const count = columns * rows
  const cellWidth = width / columns
  const cellHeight = height / rows
  const nodes = []

  for (let index = 0; index < count; index += 1) {
    const column = index % columns
    const row = Math.floor(index / columns)
    const horizontalJitter = (Math.random() - 0.5) * cellWidth * 0.72
    const verticalJitter = (Math.random() - 0.5) * cellHeight * 0.72

    nodes.push({
      baseX: cellWidth * (column + 0.5) + horizontalJitter,
      baseY: cellHeight * (row + 0.5) + verticalJitter,
      heading: Math.random() * Math.PI * 2,
      hue: NODE_HUES[(index + row) % NODE_HUES.length],
      links: [],
      phase: Math.random() * Math.PI * 2,
      size: 0.75 + Math.random() * 1.05,
      travelSpeed: 0.003 + Math.random() * 0.004,
      turnRate: (Math.random() - 0.5) * 0.000018,
      warpX: 0,
      warpY: 0,
    })
  }

  nodes.forEach((node) => {
    node.x = node.baseX
    node.y = node.baseY
  })

  const addLink = (firstIndex, secondIndex) => {
    if (!nodes[firstIndex].links.includes(secondIndex)) {
      nodes[firstIndex].links.push(secondIndex)
    }

    if (!nodes[secondIndex].links.includes(firstIndex)) {
      nodes[secondIndex].links.push(firstIndex)
    }
  }

  nodes.forEach((node, index) => {
    const nearestNodes = nodes
      .map((candidate, candidateIndex) => ({
        distance: Math.hypot(
          node.baseX - candidate.baseX,
          node.baseY - candidate.baseY,
        ),
        index: candidateIndex,
      }))
      .filter((candidate) => candidate.index !== index)
      .sort((first, second) => first.distance - second.distance)

    nearestNodes
      .slice(0, index % 4 === 0 ? 3 : 2)
      .forEach((candidate) => addLink(index, candidate.index))

    if (index > 0) {
      const nearestPreviousNode = nearestNodes.find(
        (candidate) => candidate.index < index,
      )

      if (nearestPreviousNode) addLink(index, nearestPreviousNode.index)
    }
  })

  return {
    connectionDistance: Math.hypot(cellWidth, cellHeight) * 1.65,
    nodes,
  }
}

function InteractiveNetworkBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')

    if (!canvas || !context) return undefined

    const reducedMotionQuery = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    )
    const finePointerQuery = window.matchMedia('(pointer: fine)')
    const pointer = {
      strength: 0,
      x: -1000,
      y: -1000,
    }
    let animationFrame = 0
    let connectionDistance = 180
    let height = 0
    let isDark = document.documentElement.dataset.theme === 'dark'
    let isVisible = !document.hidden
    let lastDrawTime = 0
    let nodes = []
    let width = 0

    const resizeCanvas = () => {
      const nextWidth = window.innerWidth
      const nextHeight = window.innerHeight

      width = nextWidth
      height = nextHeight
      canvas.width = nextWidth
      canvas.height = nextHeight
      const network = createNetwork(nextWidth, nextHeight)

      connectionDistance = network.connectionDistance
      nodes = network.nodes
    }

    const draw = (time = performance.now()) => {
      context.clearRect(0, 0, width, height)
      const deltaTime = reducedMotionQuery.matches
        ? 0
        : Math.min(32, lastDrawTime ? time - lastDrawTime : 0)
      const warpEasing = deltaTime ? 1 - Math.exp(-deltaTime / 190) : 0

      lastDrawTime = time

      const positions = nodes.map((node) => {
        node.heading +=
          (node.turnRate + Math.sin(time * 0.00012 + node.phase) * 0.000004) *
          deltaTime
        node.x += Math.cos(node.heading) * node.travelSpeed * deltaTime
        node.y += Math.sin(node.heading) * node.travelSpeed * deltaTime

        if (node.x < 12 || node.x > width - 12) {
          node.x = Math.min(width - 12, Math.max(12, node.x))
          node.heading = Math.PI - node.heading
        }

        if (node.y < 12 || node.y > height - 12) {
          node.y = Math.min(height - 12, Math.max(12, node.y))
          node.heading = -node.heading
        }

        const deltaX = node.x - pointer.x
        const deltaY = node.y - pointer.y
        const distance = Math.hypot(deltaX, deltaY)
        let targetWarpX = 0
        let targetWarpY = 0

        if (pointer.strength && distance < POINTER_RADIUS && distance > 0) {
          const normalizedDistance = distance / POINTER_RADIUS
          const warpCurve = Math.sin(normalizedDistance * Math.PI) ** 2
          const warp = warpCurve * 2.7 * pointer.strength

          targetWarpX = (deltaX / distance) * warp
          targetWarpY = (deltaY / distance) * warp
        }

        node.warpX += (targetWarpX - node.warpX) * warpEasing
        node.warpY += (targetWarpY - node.warpY) * warpEasing

        const x = node.x + node.warpX
        const y = node.y + node.warpY

        return { node, x, y }
      })

      for (let firstIndex = 0; firstIndex < positions.length; firstIndex += 1) {
        const first = positions[firstIndex]

        for (
          let secondIndex = firstIndex + 1;
          secondIndex < positions.length;
          secondIndex += 1
        ) {
          const second = positions[secondIndex]

          if (!first.node.links.includes(secondIndex)) continue

          const deltaX = first.x - second.x
          const deltaY = first.y - second.y
          const distance = Math.hypot(deltaX, deltaY)

          const middleX = (first.x + second.x) / 2
          const middleY = (first.y + second.y) / 2
          const pointerDistance = Math.hypot(
            middleX - pointer.x,
            middleY - pointer.y,
          )
          const pointerInfluence =
            Math.max(0, 1 - pointerDistance / POINTER_RADIUS) ** 1.35 *
            pointer.strength
          const distanceOpacity = Math.max(
            0.16,
            1 - distance / connectionDistance,
          )
          const baseOpacity = isDark ? 0.14 : 0.095
          const opacity =
            distanceOpacity * (baseOpacity + pointerInfluence * 0.095)

          context.beginPath()
          context.moveTo(first.x, first.y)
          context.lineTo(second.x, second.y)
          context.strokeStyle = `hsla(${first.node.hue} 84% ${
            isDark ? 68 : 43
          }% / ${opacity})`
          context.lineWidth = 0.7 + pointerInfluence * 0.2
          context.stroke()
        }
      }

      positions.forEach(({ node, x, y }) => {
        const pointerDistance = Math.hypot(x - pointer.x, y - pointer.y)
        const pointerInfluence =
          Math.max(0, 1 - pointerDistance / POINTER_RADIUS) ** 1.35 *
          pointer.strength
        const lightness = isDark ? 74 : 44
        const glowOpacity = (isDark ? 0.12 : 0.075) + pointerInfluence * 0.055
        const dotOpacity = (isDark ? 0.46 : 0.29) + pointerInfluence * 0.22

        context.beginPath()
        context.arc(
          x,
          y,
          node.size * 4 + pointerInfluence * 0.75,
          0,
          Math.PI * 2,
        )
        context.fillStyle = `hsla(${node.hue} 88% ${lightness}% / ${glowOpacity})`
        context.fill()

        context.beginPath()
        context.arc(x, y, node.size + pointerInfluence * 0.22, 0, Math.PI * 2)
        context.fillStyle = `hsla(${node.hue} 90% ${lightness}% / ${dotOpacity})`
        context.fill()
      })
    }

    const animate = (time) => {
      if (!isVisible) return

      draw(time)
      animationFrame = window.requestAnimationFrame(animate)
    }

    const startAnimation = () => {
      window.cancelAnimationFrame(animationFrame)

      if (reducedMotionQuery.matches) {
        draw()
        return
      }

      animationFrame = window.requestAnimationFrame(animate)
    }

    const handlePointerMove = (event) => {
      if (!finePointerQuery.matches) return

      pointer.strength = 1
      pointer.x = event.clientX
      pointer.y = event.clientY

      if (reducedMotionQuery.matches) draw()
    }

    const handlePointerLeave = () => {
      pointer.strength = 0

      if (reducedMotionQuery.matches) draw()
    }

    const handleVisibilityChange = () => {
      isVisible = !document.hidden

      if (isVisible) startAnimation()
      else window.cancelAnimationFrame(animationFrame)
    }

    const handleMotionPreferenceChange = () => startAnimation()
    const handleResize = () => {
      resizeCanvas()
      draw()
    }

    const themeObserver = new MutationObserver(() => {
      isDark = document.documentElement.dataset.theme === 'dark'
      draw()
    })

    resizeCanvas()
    startAnimation()
    themeObserver.observe(document.documentElement, {
      attributeFilter: ['data-theme'],
      attributes: true,
    })
    document.addEventListener('visibilitychange', handleVisibilityChange)
    document.documentElement.addEventListener('pointerleave', handlePointerLeave)
    window.addEventListener('blur', handlePointerLeave)
    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    window.addEventListener('resize', handleResize, { passive: true })
    reducedMotionQuery.addEventListener('change', handleMotionPreferenceChange)

    return () => {
      window.cancelAnimationFrame(animationFrame)
      themeObserver.disconnect()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      document.documentElement.removeEventListener(
        'pointerleave',
        handlePointerLeave,
      )
      window.removeEventListener('blur', handlePointerLeave)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('resize', handleResize)
      reducedMotionQuery.removeEventListener(
        'change',
        handleMotionPreferenceChange,
      )
    }
  }, [])

  return <canvas aria-hidden="true" className={styles.canvas} ref={canvasRef} />
}

export default InteractiveNetworkBackground

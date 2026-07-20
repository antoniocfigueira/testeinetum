import { useLayoutEffect, useRef, useState } from 'react'

function useElementSize() {
  const elementRef = useRef(null)
  const [size, setSize] = useState({ height: 0, width: 0 })

  useLayoutEffect(() => {
    const element = elementRef.current

    if (!element) return undefined

    const updateSize = () => {
      const { height, width } = element.getBoundingClientRect()
      const roundedHeight = Math.round(height)
      const roundedWidth = Math.round(width)

      if (roundedHeight <= 0 || roundedWidth <= 0) return

      setSize({
        height: roundedHeight,
        width: roundedWidth,
      })
    }

    updateSize()

    const observer = new ResizeObserver(updateSize)
    observer.observe(element)

    return () => observer.disconnect()
  }, [])

  return { elementRef, ...size }
}

export default useElementSize

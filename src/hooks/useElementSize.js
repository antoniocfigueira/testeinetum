import { useLayoutEffect, useRef, useState } from 'react'

function useElementSize() {
  const elementRef = useRef(null)
  const [size, setSize] = useState({ height: 0, width: 0 })

  useLayoutEffect(() => {
    const element = elementRef.current

    if (!element) return undefined

    const updateSize = () => {
      const { height, width } = element.getBoundingClientRect()

      setSize({
        height: Math.round(height),
        width: Math.round(width),
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

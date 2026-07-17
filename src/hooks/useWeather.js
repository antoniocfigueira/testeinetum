import axios from 'axios'
import { useCallback, useEffect, useState } from 'react'
import { getCurrentWeather } from '../services/weatherAPI.js'

function useWeather(country) {
  const [error, setError] = useState(null)
  const [requestVersion, setRequestVersion] = useState(0)
  const [status, setStatus] = useState(country ? 'loading' : 'idle')
  const [weather, setWeather] = useState(null)

  useEffect(() => {
    if (!country) {
      setError(null)
      setStatus('idle')
      setWeather(null)
      return undefined
    }

    const controller = new AbortController()

    setError(null)
    setStatus('loading')

    getCurrentWeather(country, {
      forceRefresh: requestVersion > 0,
      signal: controller.signal,
    })
      .then((currentWeather) => {
        setWeather(currentWeather)
        setStatus('success')
      })
      .catch((requestError) => {
        if (axios.isCancel(requestError)) return
        setError(requestError)
        setStatus('error')
      })

    return () => controller.abort()
  }, [country, requestVersion])

  const retry = useCallback(() => {
    setRequestVersion((currentVersion) => currentVersion + 1)
  }, [])

  return {
    error,
    isLoading: status === 'loading',
    retry,
    status,
    weather,
  }
}

export default useWeather

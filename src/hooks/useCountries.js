import { useCallback, useEffect, useState } from 'react'
import { getAllCountries } from '../services/countriesAPI.js'

function useCountries() {
  const [countries, setCountries] = useState([])
  const [error, setError] = useState(null)
  const [requestVersion, setRequestVersion] = useState(0)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let isActive = true

    setStatus('loading')
    setError(null)

    getAllCountries({ forceRefresh: requestVersion > 0 })
      .then((loadedCountries) => {
        if (!isActive) return
        setCountries(loadedCountries)
        setStatus('success')
      })
      .catch((requestError) => {
        if (!isActive) return
        setError(requestError)
        setStatus('error')
      })

    return () => {
      isActive = false
    }
  }, [requestVersion])

  const retry = useCallback(() => {
    setRequestVersion((currentVersion) => currentVersion + 1)
  }, [])

  return {
    countries,
    error,
    isLoading: status === 'loading',
    retry,
    status,
  }
}

export default useCountries


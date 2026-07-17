import axios from 'axios'
import { useCallback, useEffect, useState } from 'react'
import { getWeatherByCoordinates } from '../services/weatherAPI.js'

function getGeolocationError(error) {
  if (error.code === 1) {
    return new Error(
      'A permissão de localização foi recusada. Podes ativá-la nas definições do browser.',
    )
  }

  if (error.code === 2) {
    return new Error('A tua localização não está disponível neste momento.')
  }

  if (error.code === 3) {
    return new Error('A localização demorou demasiado a responder.')
  }

  return new Error('Não foi possível determinar a tua localização.')
}

function useLocalWeather() {
  const [coordinates, setCoordinates] = useState(null)
  const [error, setError] = useState(null)
  const [requestVersion, setRequestVersion] = useState(0)
  const [status, setStatus] = useState('idle')
  const [weather, setWeather] = useState(null)

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError(new Error('Este browser não suporta geolocalização.'))
      setStatus('error')
      return
    }

    setError(null)
    setStatus('locating')

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          accuracy: position.coords.accuracy,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
        setRequestVersion((currentVersion) => currentVersion + 1)
      },
      (geolocationError) => {
        setError(getGeolocationError(geolocationError))
        setStatus('error')
      },
      {
        enableHighAccuracy: true,
        maximumAge: 300000,
        timeout: 12000,
      },
    )
  }, [])

  useEffect(() => {
    if (!coordinates) return undefined

    const controller = new AbortController()

    setError(null)
    setStatus('loading-weather')

    getWeatherByCoordinates(coordinates, {
      forceRefresh: requestVersion > 1,
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
  }, [coordinates, requestVersion])

  return {
    coordinates,
    error,
    isLocating: status === 'locating',
    isWeatherLoading: status === 'loading-weather',
    requestLocation,
    status,
    weather,
  }
}

export default useLocalWeather

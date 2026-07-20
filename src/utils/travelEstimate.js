const EARTH_RADIUS_KM = 6371

function toRadians(value) {
  return (value * Math.PI) / 180
}

function getTravelCoordinates(country) {
  if (country?.capitalCoordinates?.length === 2) {
    return country.capitalCoordinates
  }

  return country?.coordinates?.length === 2 ? country.coordinates : null
}

function calculateDistance(firstCountry, secondCountry) {
  const firstCoordinates = getTravelCoordinates(firstCountry)
  const secondCoordinates = getTravelCoordinates(secondCountry)

  if (!firstCoordinates || !secondCoordinates) return null

  const [firstLatitude, firstLongitude] = firstCoordinates.map(toRadians)
  const [secondLatitude, secondLongitude] = secondCoordinates.map(toRadians)
  const latitudeDistance = secondLatitude - firstLatitude
  const longitudeDistance = secondLongitude - firstLongitude
  const haversine =
    Math.sin(latitudeDistance / 2) ** 2 +
    Math.cos(firstLatitude) *
      Math.cos(secondLatitude) *
      Math.sin(longitudeDistance / 2) ** 2

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(haversine))
}

function estimateTravel(originCountry, destinationCountry) {
  const distance = calculateDistance(originCountry, destinationCountry)

  if (distance === null) return null

  const flightHours = Math.max(0.75, distance / 820 + 0.55)
  const connectionHours = distance > 9000 ? 2.5 : distance > 4500 ? 1.25 : 0
  const airportHours = 2.75

  return {
    airportHours,
    connectionHours,
    distance: Math.round(distance),
    flightHours,
    totalHours: flightHours + connectionHours + airportHours,
  }
}

function formatTravelDuration(hours) {
  const totalMinutes = Math.max(0, Math.round((hours * 60) / 5) * 5)
  const wholeHours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (!wholeHours) return `${minutes} min`
  if (!minutes) return `${wholeHours} h`

  return `${wholeHours} h ${minutes} min`
}

export { calculateDistance, estimateTravel, formatTravelDuration }

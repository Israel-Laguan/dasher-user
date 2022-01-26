import { useEffect, useState } from 'react'

export function useClientLocation({ data, error, loading }) {
  const [isLoading, setLoading] = useState(true)
  const [hasError, setError] = useState(false)
  const [permission, setPermission] = useState(true)
  const [center, setCenter] = useState([undefined, undefined])
  const [dasher, setDasher] = useState([0, 0])
  const [currentStatus, setCurrentStatus] = useState('')

  useEffect(() => {
    setLoading(true)

    if (!loading) {
      if (error) {
        console.error(JSON.stringify(error, null, 2))
        setError(true)
        setLoading(false)
      }
      if (data) {
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            position => setCenter([Number(position.coords.latitude), Number(position.coords.longitude)]),
            err => {
              if (err.code === 1) {
                setPermission(false)
              }
              setCenter([Number(data.packages[0]?.current_lat), Number(data.packages[0]?.current_lon)])
            },
            {
              enableHighAccuracy: false,
              timeout: 15000,
              maximumAge: 0,
            },
          )
        }
        setCurrentStatus(data.packages[0]?.order_status)
        setDasher([Number(data.packages[0]?.current_lat), Number(data.packages[0]?.current_lon)])
        setLoading(false)
      }
    }
  }, [data])
  return { isLoading, hasError, center, dasher, currentStatus, permission }
}

/** @param {data} */
export function useDasherliveLocation({ data }) {
  const [isLoading, setLoading] = useState(true)
  const [dasher, setDasher] = useState([0, 0])

  useEffect(() => {
    setLoading(true)

    let geoWatch

    function watchLocation(myPosition) {
      if (!myPosition === dasher) {
        setDasher(myPosition)
      }
    }

    function startWatch() {
      if (!geoWatch) {
        if ('geolocation' in navigator && 'watchPosition' in navigator.geolocation) {
          geoWatch = navigator.geolocation.watchPosition(
            position => watchLocation([Number(position.coords.latitude), Number(position.coords.longitude)]),
            e => console.error(e),
            {
              enableHighAccuracy: false,
              timeout: 15000,
              maximumAge: 0,
            },
          )
        }
      }
    }
    function stopWatch() {
      navigator.geolocation.clearWatch(geoWatch)
      geoWatch = undefined
    }

    if (
      data.packages[0]?.order_status === 'in_travel' ||
      data.packages[0]?.order_status === 'ready' ||
      data.packages[0]?.order_status === 'collected'
    ) {
      startWatch()
    } else {
      stopWatch()
    }
  }, [data, dasher])

  return { isLoading, dasher }
}

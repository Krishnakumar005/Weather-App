import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDroplet, faCloudRain, faWind, faLeaf, faSun, faGauge } from '@fortawesome/free-solid-svg-icons';

const API_KEY = '1c1ac646ea0347c5cbe730301cd5acda';

// London's coordinates
const DEFAULT_COORDS = { lat: 51.5074, lon: -0.1278 };

function App() {
  const [city, setCity] = useState('')
  const [query, setQuery] = useState('chennai') // default city is now London
  const [coords, setCoords] = useState(DEFAULT_COORDS)
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (e) => {
    setCity(e.target.value)
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!city.trim()) return
    setQuery(city)
  }

  // Fetch coordinates for a city name
  const fetchCoords = async (cityName) => {
    const res = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(cityName)}&limit=1&appid=${API_KEY}`)
    if (!res.ok) throw new Error('City not found')
    const data = await res.json()
    if (!data[0]) throw new Error('City not found')
    return { lat: data[0].lat, lon: data[0].lon }
  }

  React.useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true)
      setError('')
      setWeather(null)
      try {
        let lat, lon
        if (query === 'London') {
          lat = DEFAULT_COORDS.lat
          lon = DEFAULT_COORDS.lon
        } else {
          const c = await fetchCoords(query)
          lat = c.lat
          lon = c.lon
        }
        setCoords({ lat, lon })
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        )
        if (!res.ok) {
          throw new Error('City not found')
        }
        const data = await res.json()
        setWeather(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    if (query) fetchWeather()
  }, [query])

  // Determine background class based on weather condition
  let bgClass = 'weather-bg';
  if (weather && weather.weather && weather.weather[0]) {
    const main = weather.weather[0].main.toLowerCase();
    if (main.includes('cloud')) bgClass += ' weather-bg-cloudy';
    else if (main.includes('rain')) bgClass += ' weather-bg-rainy';
    else if (main.includes('clear')) bgClass += ' weather-bg-sunny';
    else if (main.includes('snow')) bgClass += ' weather-bg-snowy';
    else if (main.includes('thunder')) bgClass += ' weather-bg-thunder';
    else if (main.includes('mist') || main.includes('fog')) bgClass += ' weather-bg-mist';
  }

  return (
    <div className={bgClass}>
      <div className="weather-card">
        <h1 className="weather-title">Weather App</h1>
        <form className="weather-form" onSubmit={handleSearch}>
          <input
            type="text"
            value={city}
            onChange={handleInputChange}
            placeholder="Enter city name..."
            className="weather-input"
          />
          <button
            type="submit"
            className="weather-btn"
          >
            Search
          </button>
        </form>
        {loading && (
          <div className="weather-spinner">
            <div className="weather-spinner-circle"></div>
            <span style={{marginLeft: 12, fontWeight: 500, fontSize: 18}}>Loading...</span>
          </div>
        )}
        {error && <div className="weather-error">{error}</div>}
        {weather && !loading && !error && (
          <div className="weather-info">
            <div className="weather-info-header">
              <span className="weather-city">{weather.name}, {weather.sys?.country}</span>
              {weather.weather && weather.weather[0] && (
                <img
                  src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                  alt={weather.weather[0].description}
                  className="weather-icon"
                />
              )}
            </div>
            <div className="weather-temp">{Math.round(weather.main.temp)}°C</div>
            <div className="weather-condition">{weather.weather[0].main}</div>
          </div>
        )}
      </div>
      {/* Weather metrics cards in a common card */}
      {weather && !loading && !error && (
        <div className="weather-card" style={{maxWidth: 600}}>
          <div className="weather-title" style={{fontSize: '1.3rem', fontWeight: 700, marginBottom: 18}}>Current Conditions</div>
          <div className="weather-metrics-row">
            <div className="weather-metric">
              <div className="weather-metric-icon"><FontAwesomeIcon icon={faDroplet} /></div>
              <div className="weather-metric-title">Humidity</div>
              <div className="weather-metric-value">{weather.main?.humidity}%</div>
            </div>
            <div className="weather-metric">
              <div className="weather-metric-icon"><FontAwesomeIcon icon={faCloudRain} /></div>
              <div className="weather-metric-title">Precipitation</div>
              <div className="weather-metric-value">{weather.rain?.['1h'] || 0} mm</div>
            </div>
            <div className="weather-metric">
              <div className="weather-metric-icon"><FontAwesomeIcon icon={faWind} /></div>
              <div className="weather-metric-title">Wind</div>
              <div className="weather-metric-value">{Math.round(weather.wind?.speed)} m/s</div>
            </div>
            <div className="weather-metric">
              <div className="weather-metric-icon"><FontAwesomeIcon icon={faLeaf} /></div>
              <div className="weather-metric-title">AQI</div>
              <div className="weather-metric-value-green">Fair(34)</div>
            </div>
            <div className="weather-metric">
              <div className="weather-metric-icon"><FontAwesomeIcon icon={faSun} /></div>
              <div className="weather-metric-title">UV index</div>
              <div className="weather-metric-value-green">Moderate</div>
            </div>
            <div className="weather-metric">
              <div className="weather-metric-icon"><FontAwesomeIcon icon={faGauge} /></div>
              <div className="weather-metric-title">Pressure</div>
              <div className="weather-metric-value">{weather.main?.pressure} mb</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App

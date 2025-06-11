import './App.css';
import type { WeatherData } from './types';
import { useState, useEffect } from 'react';

function App() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number} | null>(null);
  const API_KEY: string = import.meta.env.VITE_API_KEY;

  useEffect(() => {
    const getWeatherData = async () => {
      try {
        setLoading(true);
        if (!location) return;
        const { latitude, longitude } = location;
        const response = await fetch(
          `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${latitude},${longitude}/today?key=${API_KEY}`,
          { mode: 'cors' }
        );
        const json = await response.json();

        const today = json.days[0];
        const weatherData = {
          datetime: today.datetime,
          windspeed: today.windspeed,
          winddir: today.winddir,
          conditions: today.conditions,
        };

        setWeather(weatherData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching weather data: ', error);
        setLoading(false);
        setError(true);
      }
    };
    getWeatherData();
  }, [location, API_KEY]);

  const handleLocationClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition);
    } else {
      console.log('Geolocation not supported');
    }
  };

  const showPosition = (position: GeolocationPosition) => {
    const latitude: number = position.coords.latitude;
    const longitude: number = position.coords.longitude;
    setLocation({ latitude, longitude })
    console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
  };

  return (
    <>
      <div>
        {loading && 'Loading weather data...'}
        {error && 'Error fetching weather data'}
        {weather && !loading && !error && (
          <pre>{JSON.stringify(weather, null, 2)}</pre>
        )}
        <button onClick={handleLocationClick}>Click me</button>
      </div>
    </>
  );
}

export default App;

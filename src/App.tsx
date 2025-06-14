import './App.css';
import type { WeatherData } from './types';
import { useState, useEffect } from 'react';
import FetchWeatherButton from './components/FetchWeatherButton';
import Chime from './components/Chime';

export default function App() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
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

        // setWeather(json);
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
      navigator.geolocation.getCurrentPosition(showPosition, () =>
        console.log('Unable to retrieve location')
      );
    } else {
      console.log('Geolocation not supported');
    }
  };

  const showPosition = (position: GeolocationPosition) => {
    const latitude: number = position.coords.latitude;
    const longitude: number = position.coords.longitude;
    setLocation({ latitude, longitude });
    console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
  };

  return (
    <main className="dark:bg-neutral-900 bg-slate-100 h-screen">
      <FetchWeatherButton
        onChange={handleLocationClick}
        weather={weather}
        loading={loading}
        error={error}
      />
      <Chime />
    </main>
  );
}

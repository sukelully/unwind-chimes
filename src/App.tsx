import './App.css';
import type { WeatherData } from './types';
import { useState, useEffect } from 'react';
import Chime from './components/Chime';

export default function App() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [city, setCity] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [location, setLocation] = useState<{
    lat: number;
    long: number;
  } | null>(null);
  const API_KEY: string = import.meta.env.VITE_API_KEY;

  const getWeatherData = async () => {
    try {
      setLoading(true);
      if (!location) return;
      const { lat, long } = location;
      const res = await fetch(
        `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${lat},${long}/today?key=${API_KEY}`,
        { mode: 'cors' }
      );
      const json = await res.json();

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

  useEffect(() => {
    if (location) {
      getWeatherData();
    }
  }, [location]);

  const getCityFromCoords = async (
    lat: number,
    long: number
  ): Promise<string | null> => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${long}&zoom=10&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'UnwindChimes (luke@sukelully.dev)',
          },
        }
      );
      const data = await res.json();
      const address = data.address;
      return (
        address.city ||
        address.town ||
        address.village ||
        address.county ||
        null
      );
    } catch (err) {
      console.error('Could not get city from coords:', err);
      return null;
    }
  };

  const showPosition = async (position: GeolocationPosition): Promise<void> => {
    const lat: number = position.coords.latitude;
    const long: number = position.coords.longitude;
    setLocation({ lat, long });

    const cityName = await getCityFromCoords(lat, long);
    setCity(cityName);
    await getWeatherData();
    console.log(`Latitude: ${lat}, Longitude: ${long}`);
  };

  const handleLocationClick = (): void => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition, () =>
        console.log('Unable to retrieve location')
      );
    } else {
      console.log('Geolocation not supported');
    }
  };

  return (
    <main className="dark:bg-neutral-900 bg-slate-100 min-h-screen max-w-4xl mx-auto flex flex-col px-6">
      <canvas className="bg-indigo-200 p-6 w-full h-full"></canvas>
      <section id="weather-data" className="flex flex-col gap-4 my-4">
        <>
          {loading && 'Loading weather data...'}
          {error && 'Error fetching weather data'}
          {weather && !loading && !error && (
            <>
              <pre>{JSON.stringify(weather, null, 2)}</pre>
              <span className='text-center'>You're listening to <span className='font-semibold'>{city}</span></span>
            </>
          )}
        </>
        <button
          className="bg-indigo-600 text-white font-semibold p-2 rounded-md hover:bg-indigo-700"
          onClick={handleLocationClick}
        >
          Get weather data
        </button>
      </section>
      <Chime />
    </main>
  );
}

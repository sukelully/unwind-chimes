import './App.css';
import type { WeatherData } from './types';
import { useState, useEffect } from 'react';
import Chime from './components/Chime';

export default function App() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [location, setLocation] = useState<{
    city: string | null;
    country: string | null;
  } | null>(null);
  // const [location, setLocation] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [coords, setCoords] = useState<{
    lat: number;
    long: number;
  } | null>(null);
  const API_KEY: string = import.meta.env.VITE_API_KEY;

  const getWeatherData = async () => {
    try {
      setLoading(true);
      if (!coords) return;
      const { lat, long } = coords;
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
    if (coords) {
      getWeatherData();
    }
  }, [coords]);

  const getLocationFromCoords = async (
    lat: number,
    long: number
  ): Promise<{ city: string | null; country: string | null } | null> => {
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
      // setLocation(data);
      // return(data);
      return {
        city: address.city || address.town || address.village || address.county || null,
        country: address.country || null,
      };
    } catch (err) {
      console.error('Could not get city from coords:', err);
      return null;
    }
  };

  const showPosition = async (position: GeolocationPosition): Promise<void> => {
    const lat: number = position.coords.latitude;
    const long: number = position.coords.longitude;
    setCoords({ lat, long });

    const cityLocation = await getLocationFromCoords(lat, long);
    if (cityLocation) {
      setLocation(cityLocation);
    }
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
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col bg-slate-100 p-6 dark:bg-neutral-900">
      <canvas className="h-full w-full bg-indigo-200 p-6"></canvas>
      <section id="weather-data" className="my-4 flex flex-col items-center gap-4">
        <>
          {loading && 'Loading weather data...'}
          {error && 'Error fetching weather data'}
          {weather && !loading && !error && (
            <>
              <pre>{JSON.stringify(weather, null, 2)}</pre>
              {location && (
                <span className="text-center">
                  You're listening to{' '}
                  <span className="font-semibold">
                    {location.city || 'an unknown city'},{' '}
                    {location.country || 'in an unknown country'}
                  </span>
                </span>
              )}
            </>
          )}
        </>
        <button
          className="w-64 rounded-md bg-indigo-600 p-2 font-semibold text-white hover:bg-indigo-700"
          onClick={handleLocationClick}
        >
          Get weather data
        </button>
      </section>
      <section id="chimes" className="flex flex-col items-center">
        <Chime />
      </section>
    </main>
  );
}

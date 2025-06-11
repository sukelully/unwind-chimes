import './App.css';
import type { WeatherData } from './types';
import { useState, useEffect } from 'react';

function App() {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [location, setLocation] = useState<string>('york');
  const API_KEY: string = import.meta.env.VITE_API_KEY;

  useEffect(() => {
    const getWeatherData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}/today?key=${API_KEY}`,
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
        
        setData(weatherData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching weather data: ', error);
        setLoading(false);
        setError(true);
      }
    };
    getWeatherData();
  }, [location, API_KEY]);

  return (
    <>
      <div>
        {loading && 'Loading weather data...'}
        {error && 'Error fetching weather data'}
        {data && !loading && !error && <pre>{JSON.stringify(data, null, 2)}</pre>}
      </div>
    </>
  );
}

export default App;

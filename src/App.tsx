import './App.css';
import { useState, useEffect } from 'react';

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [location, setLocation] = useState<string>('york');
  const API_KEY: string = import.meta.env.VITE_API_KEY;

  useEffect(() => {
    const getWeatherData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}?key=${API_KEY}`,
          { mode: 'cors' }
        );
        setLoading(false);
        setData(await response.json());
      } catch (error) {
        // Handle error
        setLoading(false);
        setError(true);
      }
    };
    getWeatherData();
  }, [location]);

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

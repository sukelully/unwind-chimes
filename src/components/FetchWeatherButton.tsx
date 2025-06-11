import type { WeatherData } from '../types';

type Props = {
  onChange: () => void;
  loading: boolean;
  error: boolean;
  weather: WeatherData | null;
};

export default function GetWeatherData({
  onChange,
  loading,
  error,
  weather,
}: Props) {
  return (
    <div>
      {weather && (
        <>
          {loading && 'Loading weather data...'}
          {error && 'Error fetching weather data'}
          {weather && !loading && !error && (
            <pre>{JSON.stringify(weather, null, 2)}</pre>
          )}
        </>
      )}
      {!weather && (
        <button
          className="bg-indigo-600 text-white font-semibold p-2 rounded-md hover:bg-indigo-700"
          onClick={onChange}
        >
          Get weather data
        </button>
      )}
    </div>
  );
}

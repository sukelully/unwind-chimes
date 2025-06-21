import './App.css';
import { useWeatherLocation } from './hooks/useWeatherLocation';
import Chime from './components/Chime';

function App() {
  const {
    weather,
    location,
    weatherLoading,
    weatherError,
    locationLoading,
    locationError,
    loadWeatherFromLocation,
    loadRandomCity,
  } = useWeatherLocation();

  const handleLocationClick = (): void => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          loadWeatherFromLocation(pos.coords.latitude, pos.coords.longitude);
        },
        () => {
          console.error('Could not get getlocation');
        }
      );
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col bg-slate-100 p-6 dark:bg-neutral-900">
      <canvas className="h-full w-full bg-indigo-200 p-6"></canvas>
      <section id="weather-data" className="my-4 flex flex-col items-center gap-4">
        <>
          {(weatherLoading || locationLoading) && 'Loading weather data...'}
          {(weatherError || locationError) && (
            <p className="font-semibold text-red-500">
              {weatherError?.message || locationError?.message || 'Error fetching weather data'}
            </p>
          )}
          {weather && !weatherLoading && !locationLoading && !weatherError && !locationError && (
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
        <button className="btn" onClick={handleLocationClick}>
          Get local weather
        </button>
        <button className="btn" onClick={loadRandomCity}>
          Get random city
        </button>
      </section>
      <section id="chimes" className="flex flex-col items-center gap-4">
        <Chime />
      </section>
    </main>
  );
}

export default App;

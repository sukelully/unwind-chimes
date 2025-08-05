import '@/App.css';
import useWeatherLocation from '@/hooks/useWeatherLocation';
import ChimeCanvas from '@/components/ChimeCanvas';

function App() {
  const {
    weather,
    location,
    weatherLoading,
    weatherError,
    locationLoading,
    locationError,
    loadRandomCity,
    handleLocationClick,
    useExampleWeather,
  } = useWeatherLocation();

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col bg-slate-100 p-6 dark:bg-neutral-900">
      {weather && <ChimeCanvas weather={weather} />}
      <section id="weather-data" className="my-4 flex flex-col items-center gap-4">
        <button className="btn" onClick={handleLocationClick}>
          Get local weather
        </button>
        <button className="btn" onClick={loadRandomCity}>
          Get random city
        </button>
        <button className="btn" onClick={useExampleWeather}>
          Use example weather
        </button>
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
                    {location.city || 'an unknown location'}, {location.country || null}
                  </span>
                </span>
              )}
            </>
          )}
        </>
      </section>
    </main>
  );
}

export default App;

import '@/App.css';
import useWeatherLocation from '@/hooks/useWeatherLocation';
import ChimeCanvas from '@/components/ChimeCanvas';
import { farenheightToCelsius } from '@/utils/math';

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
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col p-6">
      {weather && (
        <div className="open-sans dark:text-white">
          <p>{farenheightToCelsius(weather.temp)}&deg;C</p>
          <p>{weather.conditions}</p>
          <p>
            {weather.windspeed} m/s{'  '}
            <span
              className="inline-block"
              style={{ transform: `rotate(${weather.winddir - 90}deg)` }}
            >
              &#10148;
            </span>
          </p>
          <p> </p>
          <ChimeCanvas weather={weather} />
        </div>
      )}
      <section id="weather-data" className="my-4 flex flex-col items-center gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
          <button className="btn" onClick={handleLocationClick}>
            Get local weather
          </button>
          <button className="btn" onClick={loadRandomCity}>
            Get random city
          </button>
          <button className="btn" onClick={useExampleWeather}>
            Use example weather
          </button>
        </div>
        <div className="text-center dark:text-white">
          {(weatherLoading || locationLoading) && 'Loading weather data...'}
          {(weatherError || locationError) && (
            <p className="font-semibold text-red-500">
              {weatherError?.message || locationError?.message || 'Error fetching weather data'}
            </p>
          )}
          {weather && !weatherLoading && !locationLoading && !weatherError && !locationError && (
            <>
              {location && (
                <span className="open-sans text-center dark:text-white">
                  <span className="font-semibold dark:text-white">
                    {location.city || 'an unknown location'}, {location.country || null}
                  </span>
                </span>
              )}
              <pre className="text-left dark:text-white">{JSON.stringify(weather, null, 2)}</pre>
            </>
          )}
        </div>
      </section>
    </main>
  );
}

export default App;

import '@/App.css';
import useWeatherLocation from '@/hooks/useWeatherLocation';
import ChimeCanvas from '@/components/ChimeCanvas';
import UICard from '@/components/UICard';
import WeatherCard from './components/WeatherCard';

function App() {
  const {
    weather,
    // testWeather,
    location,
    weatherLoading,
    weatherError,
    locationLoading,
    locationError,
    loadRandomCity,
    handleLocationClick,
    useExampleWeather,
    defaultWeather,
  } = useWeatherLocation();

  const chimeWeather = weather ?? defaultWeather;

  return (
    <>
      <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 px-4 py-10 sm:gap-4">
        {weather && (
          <div className="flex flex-grow flex-col dark:text-white">
            <WeatherCard weather={weather} />
          </div>
        )}

        <div className="flex flex-grow items-center justify-center">
          <ChimeCanvas weather={chimeWeather} />
        </div>

        {!location && (
          <p className="mx-auto mt-4 max-w-xs text-center text-sm text-gray-600 dark:text-gray-400">
            This app simulates wind chimes using weather data from your location or a random city
            somewhere on Earth..!
          </p>
        )}

        <div className="mt-auto">
          <UICard
            weather={weather}
            // testWeather={testWeather}
            location={location}
            weatherLoading={weatherLoading}
            weatherError={weatherError}
            locationLoading={locationLoading}
            locationError={locationError}
            loadRandomCity={loadRandomCity}
            handleLocationClick={handleLocationClick}
            useExampleWeather={useExampleWeather}
          />
        </div>
      </main>

      <a
        href="https://github.com/sukelully/unwind-chimes"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-2 left-2 z-50 rounded bg-gray-800 px-3 py-1 text-xs text-white opacity-70 transition-opacity hover:opacity-100 dark:bg-gray-200 dark:text-gray-900"
      >
        <i className="fa-brands fa-github mr-1" aria-hidden="true"></i>
        View Source
      </a>
    </>
  );
}

export default App;

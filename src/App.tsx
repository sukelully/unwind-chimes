import '@/App.css';
import useWeatherLocation from '@/hooks/useWeatherLocation';
import ChimeCanvas from '@/components/ChimeCanvas';
import UICard from '@/components/UICard';
import WeatherCard from './components/WeatherCard';

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
    defaultWeather,
  } = useWeatherLocation();

  const chimeWeather = weather ?? defaultWeather;

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 px-4 py-10 sm:gap-4">
      {weather && (
        <div className="flex flex-grow flex-col dark:text-white">
          <WeatherCard weather={weather} />
        </div>
      )}

      <div className="flex flex-grow items-center justify-center">
        <ChimeCanvas weather={chimeWeather} />
      </div>

      <div className="mt-auto">
        <UICard
          weather={weather}
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
  );
}

export default App;

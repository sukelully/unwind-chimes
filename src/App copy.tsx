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
  } = useWeatherLocation();

  return (
    <main className="relative mx-auto flex h-screen max-w-4xl flex-col px-4 pt-12 sm:pt-4">
      {/* Fixed WeatherCard at top */}
      <div className="fixed top-0 right-0 left-0 z-50 bg-white dark:bg-neutral-900">
        {weather && <WeatherCard weather={weather} />}
      </div>

      {/* Middle container fills remaining space */}
      <div className="flex flex-grow items-center justify-center pb-[12rem] sm:pb-0">
        {weather && <ChimeCanvas weather={weather} />}
      </div>

      {/* UICard container */}
      <div className="bg-white sm:relative sm:mt-6 md:fixed md:right-0 md:bottom-0 md:left-0 md:z-50 dark:bg-neutral-900">
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

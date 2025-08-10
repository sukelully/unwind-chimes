import '@/App.css';
import useWeatherLocation from '@/hooks/useWeatherLocation';
import ChimeCanvas from '@/components/ChimeCanvas';
import UICard from '@/components/UICard';
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
        <div className="dark:text-white">
          <p>{farenheightToCelsius(weather.temp)}&deg;C</p>
          <p>{weather.conditions}</p>
          <p>
            {weather.windspeed} m/s{'  '}
            <span
              className="inline-block"
              style={{ transform: `rotate(${weather.winddir + 90}deg)` }}
            >
              &#10148;
            </span>
          </p>
          <p> </p>
          <ChimeCanvas weather={weather} />
        </div>
      )}
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
    </main>
  );
}

export default App;

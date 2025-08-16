import '@/App.css';
import { useState } from 'react';
import useWeatherLocation from '@/hooks/useWeatherLocation';
import { useDarkMode } from '@/hooks/useDarkMode';
import ChimeCanvas from '@/components/ChimeCanvas';
import UICard from '@/components/UICard';
import WeatherCard from '@/components/WeatherCard';

import GitHubIcon from '@/assets/github/github.svg';
import GitHubIconDark from '@/assets/github/github-dark.svg';

function App() {
  const [btnPressed, setBtnPressed] = useState<boolean>(false);
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
  const isDarkMode = useDarkMode();
  const gitHubIcon = isDarkMode ? GitHubIconDark : GitHubIcon;

  function handleBtnPress(): void {
    setBtnPressed(true);
  }

  return (
    <>
      <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 px-4 py-10.5 sm:gap-4">
        {weather && (
          <div className="z-10 flex flex-grow flex-col dark:text-white">
            <WeatherCard weather={weather} />
          </div>
        )}

        <div className="relative flex flex-grow items-center justify-center">
          <ChimeCanvas weather={chimeWeather} />
        </div>

        <div className="relative z-10 mt-auto">
          {!btnPressed && (
            <p className="absolute bottom-full left-1/2 mb-4 w-[90%] max-w-80 -translate-x-1/2 text-center text-gray-600 sm:max-w-110 dark:text-gray-400">
              Unwind Chimes is a wind chime simulator that uses the world's climate to generate
              soothing, dynamic soundscapes.
            </p>
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
            onBtnPress={handleBtnPress}
            btnPressed={btnPressed}
          />
        </div>
      </main>

      <a
        href="https://github.com/sukelully/unwind-chimes"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-2 left-2 z-50 flex items-center rounded bg-gray-800 px-3 py-1 text-xs text-white opacity-70 transition-opacity duration-300 hover:opacity-100 dark:bg-gray-200 dark:text-gray-900"
      >
        <img src={gitHubIcon} alt="GitHub logo" className="mr-1 inline-block h-4 w-4" />
        View Source
      </a>
    </>
  );
}

export default App;

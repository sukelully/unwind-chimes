import { useState, useEffect } from 'react';
import type { Weather } from '@/types/weather';
import type { Location } from '@/types/locations';

type Props = {
  weather: Weather | null;
  // testWeather: any;
  location: Location | null;
  weatherLoading: boolean;
  weatherError: Error | null;
  locationLoading: boolean;
  locationError: Error | null;
  loadRandomCity: () => void;
  handleLocationClick: () => void;
  useExampleWeather: () => void;
  onBtnPress: () => void;
  btnPressed: boolean;
};

export default function UICard({
  weather,
  // testWeather,
  location,
  weatherLoading,
  weatherError,
  locationLoading,
  locationError,
  loadRandomCity,
  handleLocationClick,
  // useExampleWeather,
  onBtnPress,
  btnPressed,
}: Props): React.JSX.Element {
  function LoadingDots() {
    const [dots, setDots] = useState('');

    useEffect(() => {
      const interval = setInterval(() => {
        setDots((prev) => (prev.length < 3 ? prev + '.' : ''));
      }, 200);
      return () => clearInterval(interval);
    }, []);

    return <span>{dots}</span>;
  }

  function handleLocalBtnPress(): void {
    onBtnPress();
    handleLocationClick();
  }

  function handleRandomCityBtnPress(): void {
    onBtnPress();
    loadRandomCity();
  }

  return (
    <section
      id="weather-data"
      className="flex min-h-[12rem] flex-col items-center justify-end gap-4 rounded-md bg-slate-200 p-6 shadow-lg sm:min-h-[9rem] dark:bg-slate-800"
    >
      <div className="text-center text-3xl font-semibold tracking-widest dark:text-white">
        {(weatherLoading || locationLoading) && (
          <>
            <wbr></wbr>
            <LoadingDots />
          </>
        )}
        {(weatherError || locationError) && (
          <p className="open-sans font-semibold text-red-500">
            {weatherError?.message || locationError?.message || 'Error fetching weather data'}
          </p>
        )}
        {weather && !weatherLoading && !locationLoading && !weatherError && !locationError && (
          <>
            {location && (
              <span>
                <span>
                  {location.city || 'an unknown location'}, {location.country || null}
                </span>
              </span>
            )}
            {/* Data display - for development */}
            {/* <pre className="text-left dark:text-white text-sm tracking-normal">{JSON.stringify(testWeather, null, 2)}</pre> */}
          </>
        )}
        {!btnPressed && (
          <span className="font-normal">Click one of the buttons below to begin</span>
        )}
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
        <button
          className="btn"
          onClick={handleLocalBtnPress}
          aria-label="Generate chimes based on weather from your location"
        >
          Local Breeze
        </button>
        <button
          className="btn"
          onClick={handleRandomCityBtnPress}
          aria-label="Generate chimes based on weather from a random city"
        >
          Surprise Me
        </button>
        {/* <button className="btn" onClick={useExampleWeather}>
          Use example weather
        </button> */}
      </div>
    </section>
  );
}

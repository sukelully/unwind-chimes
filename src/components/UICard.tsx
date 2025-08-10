import React from 'react';
import type { Weather } from '@/types/weather';
import type { Location } from '@/types/locations';

type Props = {
  weather: Weather | null;
  location: Location | null;
  weatherLoading: boolean;
  weatherError: Error | null;
  locationLoading: boolean;
  locationError: Error | null;
  loadRandomCity: () => void;
  handleLocationClick: () => void;
  useExampleWeather: () => void;
};

export default function UICard({
  weather,
  location,
  weatherLoading,
  weatherError,
  locationLoading,
  locationError,
  loadRandomCity,
  handleLocationClick,
  useExampleWeather,
}: Props): React.JSX.Element {
  return (
    <section
      id="weather-data"
      className="flex flex-col items-center gap-4 rounded-md bg-slate-200 p-6 shadow-lg dark:bg-slate-800"
    >
      <div className="text-center dark:text-white">
        {(weatherLoading || locationLoading) && 'Loading weather data...'}
        {(weatherError || locationError) && (
          <p className="open-sans font-semibold text-red-500">
            {weatherError?.message || locationError?.message || 'Error fetching weather data'}
          </p>
        )}
        {weather && !weatherLoading && !locationLoading && !weatherError && !locationError && (
          <>
            {location && (
              <span className="open-sans text-center text-2xl tracking-widest dark:text-white">
                <span className="font-semibold dark:text-white">
                  {location.city || 'an unknown location'}, {location.country || null}
                </span>
              </span>
            )}
            {/* <pre className="text-left dark:text-white">{JSON.stringify(weather, null, 2)}</pre> */}
          </>
        )}
      </div>
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
    </section>
  );
}

import React from 'react';
import type { Weather } from '@/types/weather';
import { farenheightToCelsius } from '@/utils/math';

type Props = {
  weather: Weather;
};

function getWeatherIcon(weather: Weather): string {
  const lower = weather.conditions.toLowerCase();

  if (lower.includes('rain')) return '/icons/weather/rain.svg';
  if (weather.windspeed >= 20) return '/icons/weather/wind.svg';
  if (lower.includes('clear')) return '/icons/weather/clear.svg';
  if (lower.includes('cloud') || lower.includes('overcast')) return '/icons/weather/cloudy.svg';
  console.log(lower);

  // Fallback
  return '/icons/weather/clear.svg';
}

export default function WeatherCard({ weather }: Props): React.JSX.Element {
  const iconSrc = getWeatherIcon(weather);

  return (
    <div className="absolute flex flex-col rounded-md bg-slate-200 px-8 py-4 shadow-lg sm:top-20 dark:bg-slate-800">
      <div className="flex items-center justify-between gap-2">
        <p className="text-lg font-semibold">{farenheightToCelsius(weather.temp)}&deg;C</p>
        <img src={iconSrc} alt={weather.conditions} className="h-8 w-8" />
      </div>

      {/* Condition text */}
      <p>{weather.conditions}</p>

      {/* Wind */}
      <p>
        {weather.windspeed} m/s{' '}
        <span className="inline-block" style={{ transform: `rotate(${weather.winddir + 90}deg)` }}>
          &#10148;
        </span>
      </p>
    </div>
  );
}

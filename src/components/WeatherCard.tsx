import React from 'react';
import type { Weather } from '@/types/weather';
import { farenheightToCelsius } from '@/utils/math';
import RainIcon from '@/assets/weather/rain.svg';
import WindIcon from '@/assets/weather/wind.svg';
import ClearIcon from '@/assets/weather/clear.svg';
import CloudyIcon from '@/assets/weather/cloudy.svg';

type Props = {
  weather: Weather;
};

function getWeatherIcon(weather: Weather): string {
  const lower = weather.conditions.toLowerCase();

  if (lower.includes('rain')) return RainIcon;
  if (weather.windspeed >= 20) return WindIcon;
  if (lower.includes('clear')) return ClearIcon;
  if (lower.includes('cloud') || lower.includes('overcast')) return CloudyIcon;

  // Fallback
  return CloudyIcon;
}

function getLocalTime(timezone: string): string {
  return new Date().toLocaleString('en-US', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export default function WeatherCard({ weather }: Props): React.JSX.Element {
  const iconSrc = getWeatherIcon(weather);
  const localTime = getLocalTime(weather.timezone);

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
        <span className="inline-block" style={{ transform: `rotate(${weather.winddir + 180}deg)` }}>
          &#10148;
        </span>
      </p>
      <p>{localTime}</p>
    </div>
  );
}

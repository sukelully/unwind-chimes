import React from 'react';
import type { Weather } from '@/types/weather';
import { farenheightToCelsius } from '@/utils/math';

type Props = {
  weather: Weather;
};

export default function WeatherCard({ weather }: Props): React.JSX.Element {
  return (
    <div className="absolute border sm:top-20">
      <p>{farenheightToCelsius(weather.temp)}&deg;C</p>
      <p>{weather.conditions}</p>
      <p>
        {weather.windspeed} m/s{'  '}
        <span className="inline-block" style={{ transform: `rotate(${weather.winddir + 90}deg)` }}>
          &#10148;
        </span>
      </p>
    </div>
  );
}

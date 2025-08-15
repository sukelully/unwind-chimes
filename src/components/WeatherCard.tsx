import { useDarkMode } from '@/hooks/useDarkMode';
import type { Weather } from '@/types/weather';
import { farenheightToCelsius } from '@/utils/math';

// Light mode icons
import RainIcon from '@/assets/weather/rain.svg';
import WindIcon from '@/assets/weather/wind.svg';
import ClearIcon from '@/assets/weather/clear.svg';
import CloudyIcon from '@/assets/weather/cloudy.svg';

// Dark mode icons
import RainDarkIcon from '@/assets/weather/rain-dark.svg';
import WindDarkIcon from '@/assets/weather/wind-dark.svg';
import ClearDarkIcon from '@/assets/weather/clear-dark.svg';
import CloudyDarkIcon from '@/assets/weather/cloudy-dark.svg';

type Props = {
  weather: Weather;
};

function getWeatherIcon(weather: Weather, darkMode: boolean = false): string {
  const lower = weather.conditions.toLowerCase();

  if (lower.includes('rain')) return darkMode ? RainDarkIcon : RainIcon;
  if (weather.windspeed >= 20) return darkMode ? WindDarkIcon : WindIcon;
  if (lower.includes('clear')) return darkMode ? ClearDarkIcon : ClearIcon;
  if (lower.includes('cloud') || lower.includes('overcast'))
    return darkMode ? CloudyDarkIcon : CloudyIcon;

  return darkMode ? CloudyDarkIcon : CloudyIcon;
}

function getLocalTime(timezone: string): string {
  return new Date().toLocaleString('en-US', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export default function WeatherCard({ weather }: Props) {
  const isDarkMode = useDarkMode();
  const iconSrc = getWeatherIcon(weather, isDarkMode);
  const localTime = getLocalTime(weather.timezone);

  return (
    <div className="absolute flex flex-col rounded-md bg-slate-200 px-8 py-4 shadow-lg sm:top-20 dark:bg-slate-800">
      <div className="flex items-center justify-between gap-2">
        <p className="text-lg font-semibold">{farenheightToCelsius(weather.temp)}&deg;C</p>
        <img src={iconSrc} alt={weather.conditions} className="h-12 w-12" />
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

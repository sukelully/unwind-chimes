import { useDarkMode } from '@/hooks/useDarkMode';
import type { Weather } from '@/types/weather';
import { farenheightToCelsius } from '@/utils/math';

// Light mode icons
import RainIcon from '@/assets/weather/rain.svg';
import WindIcon from '@/assets/weather/wind.svg';
import ClearIcon from '@/assets/weather/clear.svg';
import CloudyIcon from '@/assets/weather/cloudy.svg';
import HumidityIcon from '@/assets/weather/humidity.svg';

// Dark mode icons
import RainDarkIcon from '@/assets/weather/rain-dark.svg';
import WindDarkIcon from '@/assets/weather/wind-dark.svg';
import ClearDarkIcon from '@/assets/weather/clear-dark.svg';
import CloudyDarkIcon from '@/assets/weather/cloudy-dark.svg';
import HumidityDarkIcon from '@/assets/weather/humidity-dark.svg';

type Props = {
  weather: Weather;
};

function getWeatherIcon(weather: Weather, darkMode: boolean = false): string {
  const lower = weather.conditions.toLowerCase();

  if (lower.includes('rain')) return darkMode ? RainDarkIcon : RainIcon;
  if (lower.includes('clear')) return darkMode ? ClearDarkIcon : ClearIcon;
  if (lower.includes('cloud') || lower.includes('overcast'))
    return darkMode ? CloudyDarkIcon : CloudyIcon;

  // Fallback
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

function getLocalDay(timezone: string): string {
  return new Date().toLocaleString('en-US', {
    timeZone: timezone,
    weekday: 'long', // returns full day name, e.g., "Thursday"
  });
}

export default function WeatherCard({ weather }: Props) {
  const isDarkMode = useDarkMode();
  const conditionIcon = getWeatherIcon(weather, isDarkMode);
  const windIcon = isDarkMode ? WindDarkIcon : WindIcon;
  const humidityIcon = isDarkMode ? HumidityDarkIcon : HumidityIcon;
  const localTime = getLocalTime(weather.timezone);
  const localDay = getLocalDay(weather.timezone);

  return (
    <div className="absolute flex flex-col gap-3 rounded-md bg-slate-200 px-4 py-2 shadow-lg sm:top-20 dark:bg-slate-800">
      <div className="flex items-center justify-between">
        <img src={conditionIcon} alt={`${weather.conditions} icon`} className="h-16 w-16" />

        <div className="ml-1">
          <p className="text-2xl font-semibold">{farenheightToCelsius(weather.temp)}&deg;C</p>
          <p className="text-lg">{weather.conditions}</p>
        </div>
        <div className="ml-6">
          <p className="text-lg">{localDay}</p>
          <p className="text-lg">{localTime}</p>
        </div>
      </div>

      <div className="flex flex-row justify-between gap-2 px-4">
        <div className="flex flex-row items-center gap-1">
          <img src={windIcon} alt={'Wind speed icon'} className="h-6 w-6" />
          <p className="flex flex-row items-center">
            {weather.windspeed} m/s{' '}
            <span
              className="mt-1 ml-1 inline-block"
              style={{ transform: `rotate(${weather.winddir + 180}deg)` }}
            >
              &#10148;
            </span>
          </p>
        </div>
        <div className="flex flex-row items-center">
          <img src={humidityIcon} alt={'Wind speed icon'} className="h-7 w-7" />
          <p>{weather.humidity} % </p>
        </div>
      </div>
    </div>
  );
}

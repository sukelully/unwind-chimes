import { useState } from 'react';
import cities from '../assets/cities.json';

const API_KEY: string = import.meta.env.VITE_API_KEY;

type Location = {
  city: string | null;
  country: string | null;
};

type Weather = {
  datetime: string;
  windspeed: number;
  winddir: number;
  conditions: string;
};

const useWeatherLocation = () => {
  const [weather, setWeather] = useState<Weather | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<Error | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<Error | null>(null);

  const getWeatherData = async (lat: number, long: number) => {
    try {
      setWeatherLoading(true);
      setWeatherError(null);
      const res = await fetch(
        `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${lat},${long}/today?key=${API_KEY}`,
        { mode: 'cors' }
      );
      const json = await res.json();
      const today = json.days[0];
      // setWeather(json);
      setWeather({
        datetime: today.datetime,
        windspeed: today.windspeed,
        winddir: today.winddir,
        conditions: today.conditions,
      });
    } catch (error) {
      setWeatherError(error instanceof Error ? error : new Error('Unknown weather error'));
    } finally {
      setWeatherLoading(false);
    }
  };

  const getLocationFromCoords = async (lat: number, long: number): Promise<Location | null> => {
    try {
      setLocationLoading(true);
      setLocationError(null);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${long}&zoom=10&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'UnwindChimes (luke@sukelully.dev)',
          },
        }
      );
      const data = await res.json();
      const address = data.address;
      return {
        city: address.city || address.town || address.village || address.county || null,
        country: address.country || null,
      };
    } catch (error) {
      setLocationError(error instanceof Error ? error : new Error('Unknown location error'));
      return null;
    } finally {
      setLocationLoading(false);
    }
  };

  const loadWeatherFromLocation = async (lat: number, long: number) => {
    const loc = await getLocationFromCoords(lat, long);
    if (loc) setLocation(loc);
    await getWeatherData(lat, long);
  };

  const loadRandomCity = async () => {
    const randomCity = cities[Math.floor(Math.random() * cities.length)];
    setLocation({ city: randomCity.city, country: randomCity.country });
    await getWeatherData(randomCity.lat, randomCity.long);
  };

    const handleLocationClick = (): void => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            loadWeatherFromLocation(pos.coords.latitude, pos.coords.longitude);
          },
          () => {
            console.error('Could not get getlocation');
          }
        );
      }
    };

  return {
    weather,
    location,
    weatherLoading,
    weatherError,
    locationLoading,
    locationError,
    loadRandomCity,
    handleLocationClick
  };
}

export default useWeatherLocation;
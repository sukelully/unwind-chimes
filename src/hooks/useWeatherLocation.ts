import { useState, useRef } from 'react';
import cities from '@/data/cities.json';
import type { Weather } from '@/types/weather';
import type { Location } from '@/types/locations';

const API_KEY: string = import.meta.env.VITE_API_KEY;

const useWeatherLocation = () => {
  const [weather, setWeather] = useState<Weather | null>(null);
  // const [testWeather, setTestWeather] = useState<any>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<Error | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<Error | null>(null);
  const isThrottledRef = useRef(false);

  const defaultWeather: Weather = {
    timezone: 'America/Lima',
    datetimeEpoch: 1754925554,
    temp: 90,
    humidity: 80,
    precip: 0,
    windspeed: 100,
    winddir: 0,
    cloudcover: 32.6,
    uvindex: 9,
    conditions: 'Rain, Partially cloudy',
  };

  // Fetch weather data
  const getWeatherData = async (lat: number, long: number) => {
    try {
      setWeatherLoading(true);
      setWeatherError(null);
      const res = await fetch(
        `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${lat},${long}/today?key=${API_KEY}`,
        { mode: 'cors' }
      );
      const json = await res.json();
      const currentConditions = json.currentConditions;
      // setTestWeather(json);
      setWeather({
        timezone: json.timezone,
        datetimeEpoch: currentConditions.datetimeEpoch,
        temp: currentConditions.temp,
        humidity: currentConditions.humidity,
        precip: currentConditions.precip,
        windspeed: currentConditions.windspeed,
        winddir: currentConditions.winddir,
        cloudcover: currentConditions.cloudcover,
        uvindex: currentConditions.uvindex,
        conditions: currentConditions.conditions,
      });
    } catch (error) {
      setWeatherError(error instanceof Error ? error : new Error('Unknown weather error'));
    } finally {
      setWeatherLoading(false);
    }
  };

  // Geolocation get coordinates and city/country name
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

  // Fetch weather data using coordinates
  const loadWeatherFromLocation = async (lat: number, long: number) => {
    const loc = await getLocationFromCoords(lat, long);

    if (loc) setLocation(loc);
    await getWeatherData(lat, long);
  };

  // Get weathe data from a random city in data/cities.json
  const loadRandomCity = async () => {
    // Time in ms before another API call can be made
    const apiThrottle = 1000;
    if (isThrottledRef.current) return;

    isThrottledRef.current = true;
    setTimeout(() => {
      isThrottledRef.current = false;
    }, apiThrottle);

    const randomCity = cities[Math.floor(Math.random() * cities.length)];
    setLocation({ city: randomCity.city, country: randomCity.country });
    await getWeatherData(randomCity.lat, randomCity.long);
  };

  // Get coordinates
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

  // Example weather data for testing
  const useExampleWeather = (): void => {
    const testCity = { city: 'test city', country: 'test country' };
    setWeather(defaultWeather);
    setLocation(testCity);
  };

  return {
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
  };
};

export default useWeatherLocation;

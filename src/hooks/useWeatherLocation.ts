import { useState, useRef, useEffect } from 'react';
import cities from '@/data/cities.json';
import type { Weather } from '@/types/weather';
import type { Location } from '@/types/locations';

const useWeatherLocation = () => {
  // const [testWeather, setTestWeather] = useState<any>(null);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [localWeather, setLocalWeather] = useState<Weather | null>(null);
  const [localLocation, setLocalLocation] = useState<Location | null>(null);

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
    windspeed: 0,
    winddir: 0,
    cloudcover: 32.6,
    uvindex: 9,
    conditions: '-',
  };

  // Load cached local weather from sessionStorage on mount
  useEffect(() => {
    const cachedWeather = sessionStorage.getItem('localWeather');
    const cachedLocation = sessionStorage.getItem('localLocation');

    if (cachedWeather && cachedLocation) {
      setLocalWeather(JSON.parse(cachedWeather));
      setLocalLocation(JSON.parse(cachedLocation));
    }
  }, []);

  const getWeatherData = async (lat: number, long: number): Promise<Weather | null> => {
    try {
      setWeatherLoading(true);
      setWeatherError(null);
      const res = await fetch(`/api/weather?lat=${lat}&long=${long}`);
      const json = await res.json();
      const currentConditions = json.currentConditions;
      // setTestWeather(json);

      const fetchedWeather: Weather = {
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
      };

      setWeather(fetchedWeather);
      return fetchedWeather;
    } catch (error) {
      setWeatherError(error instanceof Error ? error : new Error('Unknown weather error'));
      return null;
    } finally {
      setWeatherLoading(false);
    }
  };

  const getLocationFromCoords = async (lat: number, long: number): Promise<Location | null> => {
    try {
      setLocationLoading(true);
      setLocationError(null);
      const res = await fetch(`/api/geolocate?lat=${lat}&long=${long}`);
      const data = await res.json();
      const address = data.address;

      if (!address) throw new Error('No address found for these coordinates');

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

  const loadWeatherFromLocation = async (
    lat: number,
    long: number
  ): Promise<{ loc: Location | null; fetchedWeather: Weather | null }> => {
    const loc = await getLocationFromCoords(lat, long);
    if (loc) setLocation(loc);
    const fetchedWeather = await getWeatherData(lat, long);
    return { loc, fetchedWeather };
  };

  const loadRandomCity = async (): Promise<void> => {
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

  const handleLocationClick = async (): Promise<void> => {
    // Use cached weather if available
    if (localWeather && localLocation) {
      setWeather(localWeather);
      setLocation(localLocation);
      return;
    }

    if (!navigator.geolocation) {
      console.error('Geolocation not supported on this device.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { loc, fetchedWeather } = await loadWeatherFromLocation(
          pos.coords.latitude,
          pos.coords.longitude
        );

        if (fetchedWeather && loc) {
          setLocalWeather(fetchedWeather);
          setLocalLocation(loc);

          sessionStorage.setItem('localWeather', JSON.stringify(fetchedWeather));
          sessionStorage.setItem('localLocation', JSON.stringify(loc));
        }
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            console.error('User denied the request for Geolocation.');
            break;
          case error.POSITION_UNAVAILABLE:
            console.error('Location information is unavailable.');
            break;
          case error.TIMEOUT:
            console.error('The request to get user location timed out.');
            break;
          default:
            console.error('An unknown error occurred.', error);
            break;
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const useExampleWeather = (): void => {
    const testCity = { city: 'test city', country: 'test country' };
    setWeather(defaultWeather);
    setLocation(testCity);
  };

  return {
    weather,
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

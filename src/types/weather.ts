export type Weather = {
  timezone: string;
  datetimeEpoch: number;
  temp: number;
  humidity: number;
  precip: number;
  windspeed: number;
  winddir: number;
  cloudcover: number;
  uvindex: number;
  conditions: string;
};

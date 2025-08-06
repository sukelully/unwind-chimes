export function farenheightToCelsius(temp: number): number {
  const tempC = ((temp - 32) * 5) / 9;
  return Math.round(tempC * 10) / 10;
}

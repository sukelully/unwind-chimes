export function farenheightToCelsius(temp: number): number {
  const tempC = ((temp - 32) * 5) / 9;
  return Math.round(tempC * 10) / 10;
}

// Value remapping
export function map(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  return ((value - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;
}

import { map } from './math';

function interpolate(start: number, end: number, factor: number): number {
  return start + (end - start) * factor;
}

function interpolateHue(start: number, end: number, factor: number): number {
  const diff = end - start;

  if (Math.abs(diff) > 180) {
    if (diff > 0) {
      start += 360;
    } else {
      end += 360;
    }
  }

  const result = interpolate(start, end, factor);
  return ((result % 360) + 360) % 360;
}

export function createGradientSteps(
  startHue: number,
  endHue: number,
  saturation: number,
  startLightness: number,
  endLightness: number,
  steps: number = 5
): string[] {
  const gradientSteps: string[] = [];

  for (let i = 0; i < steps; i++) {
    const factor = i / (steps - 1);

    const h = Math.round(interpolateHue(startHue, endHue, factor));
    const l = Math.round(interpolate(startLightness, endLightness, factor));

    gradientSteps.push(`hsl(${h}, ${Math.round(saturation)}%, ${l}%)`);
  }

  return gradientSteps;
}

export function getWeatherColors(
  temp: number,
  humidity: number,
  cloudcover: number,
  uvindex: number
): [number, number, number, number, number] {
  // Temperature: Cool blues (200) to warm oranges/reds (20)
  // Wrapping around the color wheel to hit warm colors
  const tempHue =
    temp > 50
      ? map(temp, 50, 100, 40, 20) // Hot temps: orange to red
      : map(temp, 0, 50, 200, 40); // Cool to warm: blue to orange

  // Humidity: Dry conditions (low humidity) = warm colors
  // High humidity = cooler purples/blues
  const humidHue = map(humidity, 20, 90, 30, 260);

  // Cloud cover affects saturation more dramatically
  const saturation = map(cloudcover, 90, 0, 40, 85);

  // UV index affects both lightness and shifts hue toward warmer colors
  const lightness = map(uvindex, 1, 11, 45, 80);

  // High UV adds warmth by shifting toward yellows/oranges
  const uvHueShift = map(uvindex, 1, 11, 0, -20);

  const finalBaseHue = (tempHue + uvHueShift + 360) % 360;
  const finalHumidHue = (humidHue + uvHueShift + 360) % 360;

  return [finalBaseHue, finalHumidHue, saturation, lightness, lightness];
}

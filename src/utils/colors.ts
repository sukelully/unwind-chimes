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
  // 🔥 Make temp map to full hue range for variety (cool to warm to hot)
  const baseHue = map(temp, 0, 100, 240, -30); // blue → red → magenta

  // 💧 Instead of tying humidity hue directly, offset baseHue to create contrast
  // Add a ±90° offset based on humidity level
  const humidityOffset = map(humidity, 0, 100, -120, 120);
  const humidHue = (baseHue + humidityOffset + 360) % 360;

  // ☁️ Less cloud = more saturated
  const saturation = map(cloudcover, 90, 0, 50, 90);

  // 🔆 Brighter days = brighter colors
  const lightness = map(uvindex, 1, 11, 25, 75);

  return [baseHue, humidHue, saturation, lightness, lightness];
}

// Value remapping
function map(value: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
  return ((value - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;
}

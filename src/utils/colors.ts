function hexToHsl(hex: string): [number, number, number] {
  hex = hex.replace('#', '');

  if (hex.length < 6) throw new Error('Hex value is not 6 digits');

  // Convert to RGB
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);

  let h: number, s: number, l: number;
  // eslint-disable-next-line
  l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const diff = max - min;
    s = l > 0.5 ? diff / (2 - max - min) : diff / (max + min);

    switch (max) {
      case r:
        h = (g - b) / diff + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / diff + 2;
        break;
      case b:
        h = (r - g) / diff + 4;
        break;
      default:
        h = 0;
    }
    h /= 6;
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

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
  startColor: string,
  endColor: string,
  steps: number = 5
): string[] {
  const startHsl = hexToHsl(startColor);
  const endHsl = hexToHsl(endColor);

  const gradientSteps: string[] = [];

  for (let i = 0; i < steps; i++) {
    const factor = i / (steps - 1);

    const h = Math.round(interpolateHue(startHsl[0], endHsl[0], factor));
    const s = Math.round(interpolate(startHsl[1], endHsl[1], factor));
    const l = Math.round(interpolate(startHsl[2], endHsl[2], factor));

    gradientSteps.push(`hsl(${h}, ${s}%, ${l}%)`);
  }

  return gradientSteps;
}

import type { CanvasDimensions } from '@/types/canvas';
import { Chime } from '@/models/Chime';
import { Clapper } from '@/models/Clapper';
import { useState, useEffect } from 'react';
import { getScaleFrequncies, cMajPent } from '@/utils/scales';
import { createGradientSteps, getWeatherColors } from '@/utils/colors';
import { type Weather } from '@/types/weather';

const useChimeObjects = (
  dimensions: CanvasDimensions,
  getAudioContext: () => AudioContext,
  weather: Weather
) => {
  const [chimes, setChimes] = useState<Chime[]>([]);
  const [clapper, setClapper] = useState<Clapper | null>(null);

  useEffect(() => {
    const audioContext = getAudioContext();
    if (!audioContext) return;

    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    const outerRadius = Math.min(dimensions.width, dimensions.height) * 0.2;
    const chimeRadius = Math.min(dimensions.width, dimensions.height) * 0.07;

    // const colors = [
    //   'hsl(305, 47%, 70%)',
    //   'hsl(275, 72%, 74%)',
    //   'hsl(256, 66%, 76%)',
    //   'hsl(231, 63%, 76%)',
    //   'hsl(183, 68%, 69%)',
    // ];

    const [h1, h2, s, l1, l2] = getWeatherColors(
      weather.temp,
      weather.humidity,
      weather.cloudcover,
      weather.uvindex
    );
    const colors = createGradientSteps(h1, h2, s, l1, l2, 5);

    const starPoints = [];
    const freqs = getScaleFrequncies(cMajPent);

    // Create chimes in star formation
    for (let i = 0; i < 5; i++) {
      const angle = ((i * 2) % 10) * ((Math.PI * 2) / 10) - Math.PI / 2;
      const x = centerX + outerRadius * Math.cos(angle);
      const y = centerY + outerRadius * Math.sin(angle);
      starPoints.push(new Chime(x, y, colors[i], chimeRadius, freqs[i], audioContext));
    }

    setChimes(starPoints);
    setClapper(new Clapper(centerX, centerY, 'rgba(120, 113, 108, 0.9)', chimeRadius * 1.6));
  }, [dimensions, getAudioContext, weather]);

  return { chimes, clapper };
};

export default useChimeObjects;

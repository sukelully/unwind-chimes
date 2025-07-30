import type { CanvasDimensions } from '../types/canvas';
import { Chime } from '../models/Chime';
import { Clapper } from '../models/Clapper';
import { useState, useEffect } from 'react';

const useChimeObjects = (dimensions: CanvasDimensions, getAudioContext: () => AudioContext) => {
  const [chimes, setChimes] = useState<Chime[]>([]);
  const [clapper, setClapper] = useState<Clapper | null>(null);

  useEffect(() => {
    const audioContext = getAudioContext();
    if (!audioContext) return;

    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    const outerRadius = Math.min(dimensions.width, dimensions.height) * 0.2;
    const chimeRadius = Math.min(dimensions.width, dimensions.height) * 0.07;

    const colors = [
      'hsl(7, 82%, 63%)', // Red
      'hsl(13, 88%, 74%)', // Pink
      'hsl(38, 94%, 67%)', // Yellow
      'hsl(148, 54%, 58%)', // Green
      'hsl(199, 65%, 54%)', // Blue
    ];

    const starPoints = [];

    // Create chimes in star formation
    for (let i = 0; i < 5; i++) {
      const angle = ((i * 2) % 10) * ((Math.PI * 2) / 10) - Math.PI / 2;
      const x = centerX + outerRadius * Math.cos(angle);
      const y = centerY + outerRadius * Math.sin(angle);
      starPoints.push(new Chime(x, y, colors[i], chimeRadius, (i + 1) * 200, audioContext));
    }

    setChimes(starPoints);
    setClapper(new Clapper(centerX, centerY, 'rgba(120, 113, 108, 0.9)', chimeRadius * 1.5));
  }, [dimensions, getAudioContext]);

  return { chimes, clapper };
};

export default useChimeObjects;

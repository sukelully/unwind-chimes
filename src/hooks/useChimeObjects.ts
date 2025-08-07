import type { CanvasDimensions } from '@/types/canvas';
import { Chime } from '@/models/Chime';
import { Clapper } from '@/models/Clapper';
import { useState, useEffect } from 'react';
import { getScaleFrequncies, cMajPent, cMaj7Pent, cMaj9 } from '@/utils/scales';
import { createGradientSteps, getWeatherColors } from '@/utils/colors';
import { map } from '@/utils/math';
import { type Weather } from '@/types/weather';

const useChimeObjects = (
  dimensions: CanvasDimensions,
  getAudioContext: () => AudioContext,
  weather: Weather
) => {
  const [chimes, setChimes] = useState<Chime[]>([]);
  const [clapper, setClapper] = useState<Clapper | null>(null);

  // Instantiate chimes and clapper
  useEffect(() => {
    const audioContext = getAudioContext();
    if (!audioContext) return;

    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    const outerRadius = Math.min(dimensions.width, dimensions.height) * 0.28;
    const chimeRadius = Math.min(dimensions.width, dimensions.height) * 0.1;

    const [h1, h2, s, l1, l2] = getWeatherColors(
      weather.temp,
      weather.humidity,
      weather.cloudcover,
      weather.uvindex
    );
    const colors = createGradientSteps(h1, h2, s, l1, l2, 5);

    const starPoints = [];

    let freqs: number[] = [];
    switch (true) {
      case weather.windspeed < 10:
        freqs = getScaleFrequncies(cMaj9);
        break;
      case weather.windspeed >= 10 && weather.windspeed < 20:
        freqs = getScaleFrequncies(cMaj7Pent);
        break;
      case weather.windspeed >= 20 && weather.windspeed < 30:
        freqs = getScaleFrequncies(cMajPent);
        break;
      default:
        freqs = getScaleFrequncies(cMajPent);
        break;
    }

    // Map weather conditions to effects parameters
    const filterFreq = map(weather.humidity, 20, 95, 300, 1200);
    const delayLevel = map(weather.cloudcover, 0, 95, 0.1, 0.6);
    const delayTime = map(weather.precip, 0, 2, 0.1, 1.5);
    const delayFeedback = map(weather.temp, 20, 120, 0.4, 0.9);
    const effectsChain = createEffectsChain(
      audioContext,
      filterFreq,
      delayLevel,
      delayTime,
      delayFeedback
    );

    // Create chimes in star formation
    for (let i = 0; i < 5; i++) {
      const angle = ((i * 2) % 10) * ((Math.PI * 2) / 10) - Math.PI / 2;
      const x = centerX + outerRadius * Math.cos(angle);
      const y = centerY + outerRadius * Math.sin(angle);
      const chime = new Chime(x, y, colors[i], chimeRadius, freqs[i], audioContext);

      // Connect chimes to effects chain and set position
      chime.setEffectsChain(effectsChain);
      starPoints.push(chime);
    }

    setChimes(starPoints);
    setClapper(new Clapper(centerX, centerY, 'rgba(120, 113, 108, 0.9)', chimeRadius * 1.6));
  }, [dimensions, getAudioContext, weather]);

  return { chimes, clapper };

  function createEffectsChain(
    audioContext: AudioContext,
    filterFreq: number,
    delayLevel: number = 0.5,
    delayTime: number = 0.5,
    delayFeedback: number = 0.5
  ): { input: AudioNode; output: GainNode } {
    const outputGain = audioContext.createGain();
    outputGain.gain.setValueAtTime(1, audioContext.currentTime);

    const filter = audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(filterFreq, audioContext.currentTime);

    const delay = audioContext.createDelay();
    const delayWet = audioContext.createGain();
    const feedbackGain = audioContext.createGain();
    delay.delayTime.setValueAtTime(delayTime, audioContext.currentTime);

    const feedbackLimit = 0.5; // Prevent infite feedback loop
    feedbackGain.gain.setValueAtTime(
      Math.min(delayFeedback, feedbackLimit),
      audioContext.currentTime
    );
    delayWet.gain.setValueAtTime(delayLevel, audioContext.currentTime);

    // Routing
    filter.connect(delayWet);
    filter.connect(outputGain);
    delayWet.connect(delay);
    delay.connect(feedbackGain);
    feedbackGain.connect(delay);
    feedbackGain.connect(outputGain);
    outputGain.connect(audioContext.destination);

    return { input: filter, output: outputGain };
  }
};

export default useChimeObjects;

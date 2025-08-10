import { useEffect, useRef, useState } from 'react';
import { map } from '@/utils/math';
import { type Weather } from '@/types/weather';

const useAmbientAudio = (getAudioContext: () => AudioContext, play: boolean, weather: Weather) => {
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const bufferRef = useRef<AudioBuffer | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const [isBufferReady, setIsBufferReady] = useState(false);

  useEffect(() => {
    const wavUrls: string[] = [
      '/sounds/weather/calm-rain.wav',
      '/sounds/weather/calm-wind.wav',
      '/sounds/weather/heavy-wind.wav',
      '/sounds/weather/thunder.wav',
    ];

    const conditions = weather.conditions.toLowerCase();
    let url: string;

    if (conditions.includes('rain')) {
      url = wavUrls[0];
    } else if (weather.windspeed >= 20) {
      url = wavUrls[2];
    } else if (conditions.includes('storm') || conditions.includes('thunder')) {
      url = wavUrls[3];
    } else {
      url = wavUrls[1];
    }

    const audioContext = getAudioContext();
    if (!audioContext) return;

    setIsBufferReady(false);

    const loadAudio = async () => {
      try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        bufferRef.current = audioBuffer ?? null;
        setIsBufferReady(true);
      } catch (err) {
        console.error('Error loading ambient audio:', err);
      }
    };

    loadAudio();

    return () => {
      sourceRef.current?.stop();
      sourceRef.current?.disconnect();
      sourceRef.current = null;
    };
  }, [getAudioContext, weather]);

  useEffect(() => {
    const audioContext = getAudioContext();
    if (!audioContext || !isBufferReady) return;

    sourceRef.current?.stop();
    sourceRef.current?.disconnect();

    if (play && bufferRef.current) {
      const source = audioContext.createBufferSource();
      const gain = audioContext.createGain();
      const level = map(weather.windspeed, 0, 50, 0.05, 0.3);
      gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(level, audioContext.currentTime + 1);

      source.buffer = bufferRef.current;
      source.loop = true;
      source.connect(gain);
      gain.connect(audioContext.destination);
      source.start();

      sourceRef.current = source;
      gainRef.current = gain;
    } else {
      gainRef.current?.gain.exponentialRampToValueAtTime(0, audioContext.currentTime + 1);
    }
  }, [play, getAudioContext, isBufferReady]);
};

export default useAmbientAudio;

import { useEffect, useRef, useState } from 'react';
import { type Weather } from '@/types/weather';

const useAmbientAudio = (getAudioContext: () => AudioContext, play: boolean, weather: Weather) => {
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const bufferRef = useRef<AudioBuffer | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const [isBufferReady, setIsBufferReady] = useState(false);

  useEffect(() => {
    const mp3Urls: string[] = [
      '/sounds/weather/calm-rain.wav',
      '/sounds/weather/calm-wind.wav',
      '/sounds/weather/heavy-wind.wav',
      '/sounds/weather/thunder.wav',
    ];

    let url: string;

    if (weather.conditions.includes('rain')) {
      url = mp3Urls[0];
    } else if (weather.windspeed >= 20) {
      url = mp3Urls[2];
    } else if (weather.conditions.includes('storm') || weather.conditions.includes('thunder')) {
      url = mp3Urls[3];
    } else {
      url = mp3Urls[1];
    }

    const audioContext = getAudioContext();
    if (!audioContext) return;

    // Load and decode audio
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

    // Cleanup
    return () => {
      sourceRef.current?.stop();
      sourceRef.current?.disconnect();
      audioContext.close();
    };
  }, [getAudioContext, weather]);

  useEffect(() => {
    const audioContext = getAudioContext();
    if (!audioContext || !isBufferReady) return;

    if (play && bufferRef.current) {
      const source = audioContext.createBufferSource();
      const gain = audioContext.createGain();
      const level = 0.5;
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
      // Stop playback
      gainRef.current?.gain.exponentialRampToValueAtTime(0, audioContext.currentTime + 1);
      sourceRef.current?.stop();
      sourceRef.current?.disconnect();
      sourceRef.current = null;
    }
  }, [play, getAudioContext, isBufferReady]);
};

export default useAmbientAudio;

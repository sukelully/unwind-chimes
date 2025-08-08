import { useEffect, useRef } from 'react';
// import { type Weather } from "@/types/weather";

const useAmbientAudio = (getAudioContext: () => AudioContext, play: boolean) => {
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const bufferRef = useRef<AudioBuffer | null>(null);

  useEffect(() => {
    const url = 'public/sounds/weather/calm-rain.mp3';

    const audioContext = getAudioContext();
    if (!audioContext) return;

    // Load and decode audio
    const loadAudio = async () => {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      bufferRef.current = audioBuffer ?? null;
    };

    loadAudio();

    // Cleanup
    return () => {
      sourceRef.current?.stop();
      sourceRef.current?.disconnect();
      audioContext.close();
    };
  }, [getAudioContext]);

  useEffect(() => {
    const audioContext = getAudioContext();
    if (!audioContext) return;

    if (play && bufferRef.current && audioContext) {
      const source = audioContext.createBufferSource();
      source.buffer = bufferRef.current;
      source.loop = true;
      source.connect(audioContext.destination);
      source.start();
      sourceRef.current = source;
    } else {
      // Stop playback
      sourceRef.current?.stop();
      sourceRef.current?.disconnect();
      sourceRef.current = null;
    }
  }, [play, getAudioContext]);
};

export default useAmbientAudio;

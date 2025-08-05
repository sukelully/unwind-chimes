import { useRef, useEffect, useCallback } from 'react';

const useAudioContext = () => {
  const audioContextRef = useRef<AudioContext | null>(null);

  // Resume audio context or create new one if it doesn't exist
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      audioContextRef.current = new AudioContext();
    }

    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }

    return audioContextRef.current;
  }, []);

  // Closes audio context on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return { audioContext: audioContextRef.current, getAudioContext };
};

export default useAudioContext;

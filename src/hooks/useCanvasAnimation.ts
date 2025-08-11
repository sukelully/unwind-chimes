import { useRef, useEffect } from 'react';
import { Chime } from '@/models/Chime';
import { Clapper } from '@/models/Clapper';

const useCanvasAnimation = (
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  chimes: Chime[],
  clapper: Clapper | null,
  handleCollisions: () => void,
  applyContinuousWeather: () => void
) => {
  const animationRef = useRef<number | null>(null);

  // Main animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !clapper) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();

    const animate = (time: number): void => {
      const deltaTime = (time - lastTime) / 1000; // seconds
      lastTime = time;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      handleCollisions();
      applyContinuousWeather();

      const allObjects = [...chimes, clapper];
      allObjects.forEach((obj) => {
        obj.update(deltaTime); // Pass deltaTime to each object
        obj.draw(ctx);
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [canvasRef, chimes, clapper, handleCollisions, applyContinuousWeather]);
};

export default useCanvasAnimation;

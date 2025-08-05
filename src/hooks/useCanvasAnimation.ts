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

    const animate = (): void => {
      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Weather and collision logic
      handleCollisions();
      applyContinuousWeather();

      // Update and draw objects to canvas
      const allObjects = [...chimes, clapper];
      allObjects.forEach((obj) => {
        obj.update();
        obj.draw(ctx);
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Clean up on unmount or change in dependencies
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [canvasRef, chimes, clapper, handleCollisions, applyContinuousWeather]);
};

export default useCanvasAnimation;

import { useRef, useEffect } from "react";
import { Chime } from "../models/Chime";
import { Clapper } from "../models/Clapper";

const useCanvasAnimation = (
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  chimes: Chime[],
  clapper: Clapper | null,
  handleCollisions: () => void,
  applyRandomBreeze: () => void
) => {
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !clapper) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = (): void => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      handleCollisions();
      applyRandomBreeze();

      const allObjects = [...chimes, clapper];
      allObjects.forEach((obj) => {
        obj.update();
        obj.draw(ctx);
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [canvasRef, chimes, clapper, handleCollisions, applyRandomBreeze]);
};

export default useCanvasAnimation;
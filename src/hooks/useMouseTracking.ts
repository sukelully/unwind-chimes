import { useRef, useCallback } from 'react';

export type MouseEventHandler = (e: React.MouseEvent<HTMLCanvasElement>) => void;

const useMouseTracking = () => {
  const mousePositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isMouseOverCanvasRef = useRef<boolean>(false);

  // Track mouse movement within canvas
  const handleMouseMove: MouseEventHandler = useCallback((e) => {
    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    mousePositionRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  const handleMouseEnter = useCallback(() => {
    isMouseOverCanvasRef.current = true;
  }, []);

  const handleMouseLeave = useCallback(() => {
    isMouseOverCanvasRef.current = false;
  }, []);

  return {
    mousePositionRef,
    isMouseOverCanvasRef,
    handleMouseMove,
    handleMouseEnter,
    handleMouseLeave,
  };
};

export default useMouseTracking;

import { type CanvasDimensions } from '../types/canvas';
import React, { useEffect, useState, useCallback } from 'react';

const useCanvasDimensions = (containerRef: React.RefObject<HTMLDivElement | null>) => {
  const [dimensions, setDimensions] = useState<CanvasDimensions>({
    width: 800,
    height: 500,
  });

  const updateDimensions = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const newWidth = Math.max(300, rect.width - 32);
      const newHeight = Math.max(200, rect.height - 32);
      setDimensions({ width: newWidth, height: newHeight });
    }
  }, [containerRef]);

  useEffect(() => {
    updateDimensions();
    const handleResize = () => updateDimensions();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateDimensions]);

  return dimensions;
};

export default useCanvasDimensions;

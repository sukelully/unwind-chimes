import { type CanvasDimensions } from '@/types/canvas';
import React, { useEffect, useState, useCallback } from 'react';

const useCanvasDimensions = (containerRef: React.RefObject<HTMLDivElement | null>) => {
  const [dimensions, setDimensions] = useState<CanvasDimensions>({
    //  Fallback dimensions
    width: 800,
    height: 500,
  });

  const updateDimensions = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const newWidth = Math.max(300, rect.width);
      const newHeight = Math.max(200, rect.height);
      setDimensions({ width: newWidth, height: newHeight });
    }
  }, [containerRef]);

  // Update dimensions on window resize
  useEffect(() => {
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [updateDimensions]);

  return dimensions;
};

export default useCanvasDimensions;

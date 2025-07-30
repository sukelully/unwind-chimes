import React, { useRef, useCallback } from 'react';
import { Chime } from '../models/Chime.ts';
import useChimeObjects from '../hooks/useChimeObjects.ts';
import useAudioContext from '../hooks/useAudioContext.ts';
import useCanvasDimensions from '../hooks/useCanvasDimensions.ts';
import usePhysics from '../hooks/usePhysics.ts';
import useCanvasAnimation from '../hooks/useCanvasAnimation.ts';
import useMouseTracking from '../hooks/useMouseTracking.ts';

type MouseEventHandler = (e: React.MouseEvent<HTMLCanvasElement>) => void;

export default function ChimeCanvas(): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const canvasDimensions = useCanvasDimensions(containerRef);
  const { getAudioContext } = useAudioContext();
  const { chimes, clapper } = useChimeObjects(canvasDimensions, getAudioContext);
  const { handleMouseMove, handleMouseEnter, handleMouseLeave } = useMouseTracking();
  const { handleCollisions, applyRandomBreeze } = usePhysics(chimes, clapper);

  useCanvasAnimation(canvasRef, chimes, clapper, handleCollisions, applyRandomBreeze);

  const handleCanvasClick: MouseEventHandler = useCallback(
    (e) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const clickedObject = chimes.find((obj: Chime) => obj.contains(mouseX, mouseY));

      if (clickedObject) {
        clickedObject.color = `hsla(${Math.random() * 360}, 70%, 60%, 0.8)`;
        clickedObject.applyForce((Math.random() - 0.5) * 3, (Math.random() - 0.5) * 3);
      }
    },
    [chimes]
  );

  const applyGustOfWind = useCallback((): void => {
    if (clapper) {
      // Ensure audio context is ready for user interaction
      getAudioContext();
      const windForce = (Math.random() - 0.5) * 20;
      clapper.applyForce(windForce, Math.random() * 0.5);
    }
  }, [clapper, getAudioContext]);

  return (
    <div className="p-4">
      <div className="mb-4 space-x-2">
        <button
          onClick={applyGustOfWind}
          className="rounded bg-green-500 px-4 py-2 text-white transition-colors hover:bg-green-600"
        >
          Gust of Wind
        </button>
      </div>

      <div
        ref={containerRef}
        className="h-96 w-full max-w-4xl overflow-hidden rounded-lg border-2 border-gray-300 shadow-lg md:h-[500px] lg:h-[600px]"
      >
        <canvas
          ref={canvasRef}
          width={canvasDimensions.width}
          height={canvasDimensions.height}
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="h-full w-full cursor-crosshair bg-gradient-to-br from-sky-50 to-blue-100"
        />
      </div>
    </div>
  );
}

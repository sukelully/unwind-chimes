import React, { useRef, useCallback } from 'react';
import { Chime } from '../models/Chime.ts';
import useChimeObjects from '../hooks/useChimeObjects.ts';
import useAudioContext from '../hooks/useAudioContext.ts';
import useCanvasDimensions from '../hooks/useCanvasDimensions.ts';
import usePhysics from '../hooks/usePhysics.ts';
import useCanvasAnimation from '../hooks/useCanvasAnimation.ts';
import useMouseTracking from '../hooks/useMouseTracking.ts';
import { type MouseEventHandler } from '../hooks/useMouseTracking.ts';

type Props = {
  windSpeed: number | undefined;
};

export default function ChimeCanvas({ windSpeed }: Props): React.JSX.Element {
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
      
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      
      const mouseX = (e.clientX - rect.left) * scaleX;
      const mouseY = (e.clientY - rect.top) * scaleY;
      
      const clickedChime = chimes.find((chime: Chime) => {
        const dx = mouseX - chime.x;
        const dy = mouseY - chime.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        return distance <= chime.r;
      });
      if (clickedChime) {
        clickedChime.playSimpleChime(clickedChime.freq, 5);
      }
    },
    [chimes]
  );

  const applyGustOfWind = useCallback((): void => {
    if (clapper) {
      getAudioContext();

      const speed = windSpeed ?? 15;

      const windForceX = (Math.random() - 0.5) * speed;
      const windForceY = (Math.random() - 0.5) * speed;
      console.log(`windSpeed: ${speed}`);
      console.log(`windForceX: ${windForceX}`);

      clapper.applyForce(windForceX, windForceY);
    }
  }, [clapper, getAudioContext, windSpeed]);

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
          style={{ width: canvasDimensions.width, height: canvasDimensions.height }}
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="cursor-crosshair bg-gradient-to-br from-sky-50 to-blue-100"
        />
      </div>
    </div>
  );
}

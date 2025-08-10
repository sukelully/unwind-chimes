import React, { useRef, useCallback } from 'react';
import { Chime } from '@/models/Chime';
import useChimeObjects from '@/hooks/useChimeObjects';
import useAudioContext from '@/hooks/useAudioContext';
import useCanvasDimensions from '@/hooks/useCanvasDimensions';
import usePhysics from '@/hooks/usePhysics';
import useCanvasAnimation from '@/hooks/useCanvasAnimation';
import useMouseTracking from '@/hooks/useMouseTracking';
import useAmbientAudio from '@/hooks/useAmbientAudio';
import { type MouseEventHandler } from '@/hooks/useMouseTracking';
import { type Weather } from '@/types/weather';

type Props = {
  weather: Weather;
};

export default function ChimeCanvas({ weather }: Props): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const canvasDimensions = useCanvasDimensions(containerRef);
  const { getAudioContext } = useAudioContext();
  const { chimes, clapper } = useChimeObjects(canvasDimensions, getAudioContext, weather);
  const { handleMouseMove, handleMouseEnter, handleMouseLeave } = useMouseTracking();
  const { handleCollisions, applyContinuousWeather } = usePhysics(chimes, clapper, weather);

  useCanvasAnimation(canvasRef, chimes, clapper, handleCollisions, applyContinuousWeather);
  useAmbientAudio(getAudioContext, true, weather);

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
        // Play chime
        clickedChime.playChime(0.2);
      }
    },
    [chimes]
  );

  return (
    <div ref={containerRef} className="h-92 w-full max-w-4xl overflow-hidden md:h-[400px]">
      <canvas
        ref={canvasRef}
        width={canvasDimensions.width}
        height={canvasDimensions.height}
        style={{ width: canvasDimensions.width, height: canvasDimensions.height }}
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="cursor-crosshair"
      />
    </div>
  );
}

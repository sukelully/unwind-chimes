import React, { useRef, useEffect, useState, useCallback } from 'react';
import { type CanvasDimensions } from '../types/canvas.ts';
import { Chime } from '../models/Chime.ts';

type MouseEventHandler = (e: React.MouseEvent<HTMLCanvasElement>) => void;

export default function ChimeCanvas(): React.JSX.Element {
  const [canvasDimensions, setCanvasDimensions] = useState<CanvasDimensions>({
    width: 800,
    height: 500,
  });
  const [chimes, setChimes] = useState<Chime[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(null);
  const mousePositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isMouseOverCanvasRef = useRef<boolean>(false);

  // Function to update canvas dimensions based on container size
  const updateCanvasDimensions = useCallback(() => {
    if (containerRef.current) {
      const container = containerRef.current;
      const rect = container.getBoundingClientRect();

      // Use container dimensions with some padding
      const newWidth = Math.max(300, rect.width - 32); // min 300px, subtract padding
      const newHeight = Math.max(200, rect.height - 32); // min 200px, subtract padding

      setCanvasDimensions({ width: newWidth, height: newHeight });
    }
  }, []);

  // Update dimensions on mount and window resize
  useEffect(() => {
    updateCanvasDimensions();

    const handleResize = () => {
      updateCanvasDimensions();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateCanvasDimensions]);

  // Initialize chimes when dimensions change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const centerX = canvasDimensions.width / 2;
    const centerY = canvasDimensions.height / 2;
    const outerRadius = Math.min(canvasDimensions.width, canvasDimensions.height) / 4;

    const colors = [
      'rgba(59, 130, 246, 0.8)',  // Blue
      'rgba(34, 197, 94, 0.8)',   // Green
      'rgba(239, 68, 68, 0.8)',   // Red
      'rgba(147, 51, 234, 0.8)',  // Purple
      'rgba(249, 115, 22, 0.8)',  // Orange
    ];

    // Angles to form a 5-pointed star
    const starPoints = [];
    for (let i = 0; i < 5; i++) {
      const angle = ((i * 2) % 10) * ((Math.PI * 2) / 10) - Math.PI / 2;
      const x = centerX + outerRadius * Math.cos(angle);
      const y = centerY + outerRadius * Math.sin(angle);
      starPoints.push(new Chime(x, y, colors[i]));
    }
    
    setChimes(starPoints);
  }, [canvasDimensions]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = (): void => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Apply mouse force to nearby chimes when mouse is over canvas
      if (isMouseOverCanvasRef.current) {
        chimes.forEach((obj: Chime) => {
          const distance = Math.sqrt(
            Math.pow(mousePositionRef.current.x - (obj.x + obj.r), 2) +
              Math.pow(mousePositionRef.current.y - (obj.y + obj.r), 2)
          );

          // Apply force if mouse is within influence range
          if (distance < 120) {
            obj.applyMouseForce(mousePositionRef.current.x, mousePositionRef.current.y, 0.2);
          }
        });
      }

      // Occasionally apply gentle breeze effect
      if (Math.random() < 0.005) {
        const randomObject = chimes[Math.floor(Math.random() * chimes.length)];
        if (randomObject) {
          randomObject.applyBreeze(0.15);
        }
      }

      // Update and draw all chimes
      chimes.forEach((obj: Chime) => {
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
  }, [chimes]);

  const handleMouseMove: MouseEventHandler = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const chime = canvas.getBoundingClientRect();
    mousePositionRef.current = {
      x: e.clientX - chime.left,
      y: e.clientY - chime.top,
    };
  };

  const handleMouseEnter = () => {
    isMouseOverCanvasRef.current = true;
  };

  const handleMouseLeave = () => {
    isMouseOverCanvasRef.current = false;
  };

  const handleCanvasClick: MouseEventHandler = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX: number = e.clientX - rect.left;
    const mouseY: number = e.clientY - rect.top;

    // Check if click hit any object
    const clickedObject = chimes.find((obj: Chime) => obj.contains(mouseX, mouseY));

    if (clickedObject) {
      // Change color and apply a strong force
      clickedObject.color = `hsla(${Math.random() * 360}, 70%, 60%, 0.8)`;
      clickedObject.applyForce((Math.random() - 0.5) * 3, (Math.random() - 0.5) * 3);
    }
  };

  const applyGustOfWind = (): void => {
    chimes.forEach((obj) => {
      const windForce = (Math.random() - 0.5) * 2;
      obj.applyForce(windForce, Math.random() * 0.5);
    });
  };

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

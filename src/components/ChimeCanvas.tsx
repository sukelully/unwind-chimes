import React, { useRef, useEffect, useState } from 'react';
import { type CanvasDimensions } from '../types/canvas.ts';
import { Chime } from '../models/Chime.ts';

type MouseEventHandler = (e: React.MouseEvent<HTMLCanvasElement>) => void;

export default function ChimeCanvas(): React.JSX.Element {
  const canvasDimensions: CanvasDimensions = { width: 800, height: 500 };
  const [chimes, setChimes] = useState<Chime[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(null);
  const mousePositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isMouseOverCanvasRef = useRef<boolean>(false);

  useEffect(() => {
    // Initialize chimes with wind chime physics
    const initialChimes: Chime[] = [
      new Chime(100, 100, 80, 60, 'rgba(59, 130, 246, 0.8)'),
      new Chime(200, 150, 60, 80, 'rgba(34, 197, 94, 0.8)'),
      new Chime(300, 200, 100, 40, 'rgba(239, 68, 68, 0.8)'),
      new Chime(400, 100, 50, 90, 'rgba(147, 51, 234, 0.8)'),
      new Chime(150, 250, 70, 50, 'rgba(249, 115, 22, 0.8)'),
    ];

    setChimes(initialChimes);
  }, []);

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
            Math.pow(mousePositionRef.current.x - (obj.x + obj.width / 2), 2) +
              Math.pow(mousePositionRef.current.y - (obj.y + obj.height / 2), 2)
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

    const rect = canvas.getBoundingClientRect();
    mousePositionRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
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
    } else {
      // Add new wind chime rectangle at click position
      const newRect = new Chime(
        mouseX - 25,
        mouseY - 25,
        40 + Math.random() * 40,
        40 + Math.random() * 40,
        `hsla(${Math.random() * 360}, 70%, 60%, 0.8)`
      );

      // Set up physics for the new object
      newRect.setPhysicsProperties(0.98, 0.015, 40);

      setChimes((prev: Chime[]) => [...prev, newRect]);
    }
  };

  const clearCanvas = (): void => {
    setChimes([]);
  };

  const addWindChime = (): void => {
    const newRect = new Chime(
      Math.random() * (canvasDimensions.width - 100) + 50,
      Math.random() * (canvasDimensions.height - 100) + 50,
      40 + Math.random() * 60,
      40 + Math.random() * 60,
      `hsla(${Math.random() * 360}, 70%, 60%, 0.8)`
    );

    // Set up physics properties
    newRect.setPhysicsProperties(0.98, 0.015, 40);

    setChimes((prev: Chime[]) => [...prev, newRect]);
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
          onClick={addWindChime}
          className="rounded bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
        >
          Add Wind Chime
        </button>
        <button
          onClick={applyGustOfWind}
          className="rounded bg-green-500 px-4 py-2 text-white transition-colors hover:bg-green-600"
        >
          Gust of Wind
        </button>
        <button
          onClick={clearCanvas}
          className="rounded bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600"
        >
          Clear Canvas
        </button>
      </div>

      <div className="inline-block overflow-hidden rounded-lg border-2 border-gray-300 shadow-lg">
        <canvas
          ref={canvasRef}
          width={canvasDimensions.width}
          height={canvasDimensions.height}
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="cursor-crosshair bg-gradient-to-br from-sky-50 to-blue-100"
        />
      </div>

      <div className="mt-4 space-y-1 text-sm text-gray-600">
        <p>
          • <strong>Hover</strong> your mouse over wind chimes to make them sway
        </p>
        <p>
          • <strong>Click</strong> on wind chimes to change color and give them a push
        </p>
        <p>
          • <strong>Click</strong> empty space to add a new wind chime
        </p>
        <p>• Watch them gently sway and settle back to their rest positions</p>
        <p>
          • Active wind chimes: <span className="font-semibold text-blue-600">{chimes.length}</span>
        </p>
      </div>
    </div>
  );
}

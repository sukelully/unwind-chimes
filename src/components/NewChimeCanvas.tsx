import React, { useRef, useEffect, useState } from 'react';
import { type Drawable, type CanvasDimensions, type Colorable } from '../types.ts';
import { DrawableRect } from './NewChime';

type MouseEventHandler = (e: React.MouseEvent<HTMLCanvasElement>) => void;

export default function CanvasDrawing(): React.JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [objects, setObjects] = useState<Drawable[]>([]);
  const animationRef = useRef<number>(0);
  const canvasDimensions: CanvasDimensions = { width: 800, height: 500 };

  useEffect(() => {
    // Initialize objects with proper typing
    const initialObjects: Drawable[] = [
      new DrawableRect(100, 100, 80, 60, 'blue'),
      new DrawableRect(200, 150, 60, 80, 'green'),
      new DrawableRect(300, 200, 100, 40, 'red'),
      new DrawableRect(400, 100, 50, 90, 'purple'),
      new DrawableRect(150, 250, 70, 50, 'orange'),
    ];
    setObjects(initialObjects);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = (): void => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw all objects
      objects.forEach((obj: Drawable) => {
        obj.update(canvas.width, canvas.height);
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
  }, [objects]);

  const handleCanvasClick: MouseEventHandler = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX: number = (e.clientX = rect.left);
    const mouseY: number = e.clientY - rect.top;

    // Check if click hit any object
    const clickedObject = objects.find((obj: Drawable) => obj.contains(mouseX, mouseY));

    if (clickedObject && 'color' in clickedObject) {
      // Type guard to ensure object has color property
      (clickedObject as Colorable).color = `hsl(${Math.random() * 360}, 70%, 50%)`;
    } else {
      // Add new rectangle at click position
      const newRect = new DrawableRect(
        mouseX - 25,
        mouseY - 25,
        50 + Math.random() * 50,
        50 + Math.random() * 50,
        `hsl(${Math.random() * 360}, 70%, 50%)`
      );
      setObjects((prev: Drawable[]) => [...prev, newRect]);
    }
  };

  const clearCanvas = (): void => {
    setObjects([]);
  }

  const addRandomRectangles = (): void => {
    const newObjects: DrawableRect[] = [];
    for (let i = 0; i < 3; i++) {
      newObjects.push(new DrawableRect(
        Math.random() * 700,
        Math.random() * 400,
        30 + Math.random() * 80,
        30 + Math.random() * 80,
        `hsl(${Math.random() * 360}, 70%, 50%)`
      ));
    }
    setObjects((prev: Drawable[]) => [...prev, ...newObjects]);
  };

  return (
    <div className="p-4">
      <div className="mb-4 space-x-2">
        <button 
          onClick={addRandomRectangles}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add Random Rectangles
        </button>
        <button 
          onClick={clearCanvas}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Clear Canvas
        </button>
      </div>
      
      <div className="border-2 border-gray-300 inline-block">
        <canvas
          ref={canvasRef}
          width={canvasDimensions.width}
          height={canvasDimensions.height}
          onClick={handleCanvasClick}
          className="cursor-crosshair bg-gray-50"
        />
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <p>• Click on rectangles to change their color</p>
        <p>• Click empty space to add a new rectangle</p>
        <p>• Rectangles animate automatically</p>
        <p>• Total rectangles: {objects.length}</p>
      </div>
    </div>
  );
}

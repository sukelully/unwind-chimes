import { useRef, useEffect } from 'react';

export default function ChimeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  function draw(ctx: CanvasRenderingContext2D, frameCount: number): void {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(50, 100, 20*Math.sin(frameCount*0.05)**2, 0, 2*Math.PI);
    ctx.fill();
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    let frameCount: number = 0;
    let animationFrameId: number;

    const render = () => {
      frameCount++;
      draw(context, frameCount);
      animationFrameId = window.requestAnimationFrame(render);
    }
    render();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    }
  }, [draw]);

  return <canvas ref={canvasRef} className="h-full w-full bg-indigo-200 p-6"></canvas>;
}

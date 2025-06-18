// import { useState, useEffect, useRef } from 'react';

// function ChimeCanvas() {
//     const canvasRef = useRef<HTMLCanvasElement>(null);
//     const [chimes, setChimes] = useState<Chime[]>([]);

//     useEffect(() => {
//         const ctx = canvasRef.current?.getContext("2d");
//         if (!ctx) return;

//         const initChimes = createChimes();
//         setChimes(initChimes);

//         let animationFrameId: number;

//         const animate = () => {
//             ctx.clearRect(0, 0, canvas.width, canvas.height);

//             // calculate wind force here
//             for (const chime of initChimes) {
//                 chime.update();
//                 chime.draw(ctx);
//             }

//             animationFrameId = requestAnimationFrame(animate);
//         }

//         animate();
//         return () => cancelAnimationFrame(animationFrameId);
//     }, []);

//     return <canvas ref={canvasRef} width={800} height={600} />
// }

// export default ChimeCanvas;
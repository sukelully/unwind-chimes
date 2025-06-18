import { useState, useRef } from 'react';

function ChimeCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [chimes, setChimes] = useState<Chime[]>([]);
}
import React, { useRef, useEffect, useState, useCallback } from 'react';

interface PixelData {
    x: number;
    y: number;
    size: number;
    color: string;
}

interface PixelWaveProps {
    imageUrl: string;
    pixelSize?: number;
}

const PixelWave: React.FC<PixelWaveProps> = ({
    imageUrl,
    pixelSize = 8,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const pixelsRef = useRef<PixelData[]>([]);
    const [mousePosition, setMousePosition] = useState({ x: -1000, y: -1000 });

    const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
        if (canvasRef.current) {
            const rect = canvasRef.current.getBoundingClientRect();
            setMousePosition({
                x: event.clientX - rect.left,
                y: event.clientY - rect.top,
            });
        }
    }, []);

    const handleMouseLeave = useCallback(() => {
        setMousePosition({ x: -1000, y: -1000 });
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d', { willReadFrequently: true });
        const img = new Image();
        img.src = imageUrl;
        img.crossOrigin = "Anonymous";

        img.onload = () => {
            if (!canvas || !ctx) return;
            
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            const cw = canvas.width;
            const ch = canvas.height;
            const iw = img.width;
            const ih = img.height;

            const cRatio = cw / ch;
            const iRatio = iw / ih;

            let sWidth = iw;
            let sHeight = ih;
            let sx = 0;
            let sy = 0;

            if (iRatio > cRatio) {
                sWidth = ih * cRatio;
                sx = (iw - sWidth) / 2;
            } else {
                sHeight = iw / cRatio;
                sy = (ih - sHeight) / 2;
            }

            ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, cw, ch);

            const imageData = ctx.getImageData(0, 0, cw, ch);
            const data = imageData.data;
            const tempPixels: PixelData[] = [];

            for (let y = 0; y < ch; y += pixelSize) {
                for (let x = 0; x < cw; x += pixelSize) {
                    const index = (y * cw + x) * 4;
                    const r = data[index];
                    const g = data[index + 1];
                    const b = data[index + 2];
                    const a = data[index + 3];

                    if (a > 50) {
                        tempPixels.push({
                            x: x,
                            y: y,
                            size: pixelSize,
                            color: `rgb(${r}, ${g}, ${b})`,
                        });
                    }
                }
            }
            pixelsRef.current = tempPixels;
            ctx.clearRect(0, 0, cw, ch);
        };
    }, [imageUrl, pixelSize]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let time = 0;

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            time += 0.01;

            pixelsRef.current.forEach((pixel) => {
                let drawX = pixel.x;
                let drawY = pixel.y;

                const dx = mousePosition.x - pixel.x;
                const dy = mousePosition.y - pixel.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                const maxDist = 220;
                if (distance < maxDist && distance > 0) {
                    const normalizedDist = distance / maxDist;
                    const factor = Math.pow(1 - normalizedDist, 3); 

                    drawY += Math.sin(time * 1.5 + pixel.x * 0.02) * 6 * factor;
                    drawX += Math.cos(time * 1.5 + pixel.y * 0.02) * 6 * factor;
                }

                ctx.fillStyle = pixel.color;
                ctx.fillRect(drawX, drawY, pixel.size, pixel.size);
            });

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [mousePosition]);

    return (
        <div style={{ width: '100vw', height: '100vh', backgroundColor: '#0f0f0f', overflow: 'hidden', margin: 0, padding: 0 }}>
            <canvas
                ref={canvasRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{ display: 'block', cursor: 'crosshair', width: '100%', height: '100%' }}
            />
        </div>
    );
};

export default PixelWave;
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
    const [activeModal, setActiveModal] = useState<string | null>(null);

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

    const getModalPosition = (modalName: string) => {
        switch (modalName) {
            case 'about':
                return { top: '15vh', left: '10vw', right: 'auto' };
            case 'experience':
                return { top: '20vh', left: 'auto', right: '10vw' };
            case 'work':
                return { top: '35vh', left: '15vw', right: 'auto' };
            case 'contact':
                return { top: '30vh', left: 'auto', right: '12vw' };
            default:
                return { top: '25vh', left: '30vw', right: 'auto' };
        }
    };

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
            time += 0.02;

            pixelsRef.current.forEach((pixel) => {
                let drawX = pixel.x;
                let drawY = pixel.y;

                const dx = mousePosition.x - pixel.x;
                const dy = mousePosition.y - pixel.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                const maxDist = 160;
                if (distance < maxDist && distance > 0) {
                    const normalizedDist = distance / maxDist;
                    const factor = Math.cos(normalizedDist * Math.PI * 0.5); 

                    drawY += Math.sin(time + pixel.x * 0.03) * 4 * factor;
                    drawX += Math.cos(time + pixel.y * 0.03) * 4 * factor;
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

    const modalPosition = activeModal ? getModalPosition(activeModal) : { top: '0', left: '0', right: 'auto' };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: '#0f0f0f', overflow: 'hidden', margin: 0, padding: 0 }}>
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Source+Code+Pro:ital,wght@0,400;0,600;0,700;1,400&display=swap');
                    .contact-link:hover {
                        color: #38bdf8 !important;
                        text-decoration: underline;
                    }
                `}
            </style>

            <canvas
                ref={canvasRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{ display: 'block', cursor: 'crosshair', width: '100vw', height: '100vh', position: 'absolute', top: 0, left: 0 }}
            />

            <nav style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100vw',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '30px 50px',
                boxSizing: 'border-box',
                zIndex: 100,
                fontFamily: '"Source Code Pro", monospace',
                color: '#fff',
                textShadow: '0 2px 4px rgba(0,0,0,0.6)',
            }}>
                <div style={{ fontSize: '20px', fontWeight: '700', letterSpacing: '0.5px', cursor: 'pointer' }} onClick={() => setActiveModal(null)}>
                    Eunjeong Yang
                </div>

                <div style={{ display: 'flex', gap: '40px', fontSize: '16px', fontWeight: '600', letterSpacing: '0.5px' }}>
                    <span onClick={() => setActiveModal('about')} style={{ cursor: 'pointer' }}>about</span>
                    <span onClick={() => setActiveModal('experience')} style={{ cursor: 'pointer' }}>experience</span>
                    <span onClick={() => setActiveModal('work')} style={{ cursor: 'pointer' }}>work</span>
                    <span onClick={() => setActiveModal('contact')} style={{ cursor: 'pointer' }}>contact</span>
                </div>
            </nav>

            {activeModal && (
                <div style={{
                    position: 'absolute',
                    top: modalPosition.top,
                    left: modalPosition.left,
                    right: modalPosition.right,
                    width: '540px',
                    maxHeight: '75vh',
                    overflowY: 'auto',
                    backgroundColor: '#e6e6e2',
                    border: '3px solid #111',
                    boxShadow: '10px 10px 0px #111',
                    fontFamily: '"Source Code Pro", monospace',
                    textAlign: 'center',
                    boxSizing: 'border-box',
                    zIndex: 200,
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: '#1a1a1a',
                        padding: '12px 20px',
                        borderBottom: '3px solid #111',
                        color: '#38bdf8',
                        fontWeight: '700',
                        fontSize: '18px',
                        letterSpacing: '1px',
                    }}>
                        <span style={{ width: '100%', textAlign: 'center', paddingLeft: '24px' }}>{activeModal.toUpperCase()}</span>
                        <button 
                            onClick={() => setActiveModal(null)}
                            style={{ 
                                background: 'transparent', 
                                color: '#fff', 
                                border: 'none', 
                                fontSize: '18px',
                                fontWeight: 'bold', 
                                cursor: 'pointer',
                                padding: '0',
                                lineHeight: '1',
                            }}
                        >
                            ✕
                        </button>
                    </div>

                    <div style={{ padding: '30px 35px', color: '#222', fontSize: '14px', lineHeight: '1.8', fontFamily: '"Source Code Pro", monospace' }}>
                        {activeModal === 'about' && (
                            <div>
                                <p style={{ fontWeight: '700', marginBottom: '15px', fontSize: '15px' }}>Eunjeong Yang (Jamie)</p>
                                <p style={{ marginBottom: '15px' }}>Developer with a background in visual arts, currently based in Vancouver.</p>
                                <p style={{ marginBottom: '25px' }}>Interested in building thoughtful digital experiences through design and code, and exploring visual storytelling through photography.</p>
                                <p style={{ marginBottom: '10px' }}><strong>Tech Stack:</strong> HTML · CSS · JavaScript · React · Java · Git · GitHub · REST APIs</p>
                                <p><strong>Strengths:</strong> Problem Solving · Communication · Collaboration · Attention to Detail</p>
                            </div>
                        )}
                        {activeModal === 'experience' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', textAlign: 'center' }}>
                                <div>
                                    <p style={{ fontWeight: '700', marginBottom: '4px' }}>ETRIBE — Digital Agency</p>
                                    <p style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>Seoul, South Korea · Nov 2022 – May 2025</p>
                                    <p style={{ fontSize: '13px', lineHeight: '1.6' }}>
                                        • Developed and maintained production-level web applications<br/>
                                        • Implemented new features and resolved bugs based on client requirements<br/>
                                        • Integrated RESTful APIs and database-driven logic<br/>
                                        • Collaborated with designers and planners to deliver responsive interfaces
                                    </p>
                                </div>
                                <div style={{ borderTop: '1px dashed #bbb', paddingTop: '20px' }}>
                                    <p style={{ fontWeight: '700', marginBottom: '4px' }}>Seoul Institute of the Arts</p>
                                    <p style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>South Korea · Mar 2019 – Feb 2022</p>
                                    <p style={{ fontSize: '13px' }}>Associate Degree – Photography</p>
                                </div>
                            </div>
                        )}
{activeModal === 'work' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', textAlign: 'left' }}>
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                                        <p style={{ fontWeight: '700', fontSize: '15px', color: '#111', margin: 0 }}>Jamie's portfolio</p>
                                        <p style={{ fontSize: '13px', margin: 0 }}>
                                            <a href="https://eunjeongyang.netlify.app/" target="_blank" rel="noopener noreferrer" className="contact-link" style={{ color: '#111', textDecoration: 'none', fontWeight: '600' }}>Live</a>
                                            <span style={{ margin: '0 6px', color: '#888' }}>·</span>
                                            <a href="https://github.com/jamiejy927/midterm-portfolio" target="_blank" rel="noopener noreferrer" className="contact-link" style={{ color: '#111', textDecoration: 'none', fontWeight: '600' }}>GitHub</a>
                                        </p>
                                    </div>
                                    <p style={{ fontSize: '13px', color: '#555', margin: 0, lineHeight: '1.5' }}>Personal portfolio website designed and built with HTML and CSS.</p>
                                </div>
                                <div style={{ borderTop: '1px dashed #bbb', paddingTop: '20px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                                        <p style={{ fontWeight: '700', fontSize: '15px', color: '#111', margin: 0 }}>Past Lives</p>
                                        <p style={{ fontSize: '13px', margin: 0 }}>
                                            <a href="https://past-lives-website.netlify.app/" target="_blank" rel="noopener noreferrer" className="contact-link" style={{ color: '#111', textDecoration: 'none', fontWeight: '600' }}>Live</a>
                                            <span style={{ margin: '0 6px', color: '#888' }}>·</span>
                                            <a href="https://github.com/jamiejy927/past-lives-website" target="_blank" rel="noopener noreferrer" className="contact-link" style={{ color: '#111', textDecoration: 'none', fontWeight: '600' }}>GitHub</a>
                                        </p>
                                    </div>
                                    <p style={{ fontSize: '13px', color: '#555', margin: 0, lineHeight: '1.5' }}>A website inspired by the film Past Lives, focusing on layout and visual storytelling.</p>
                                </div>
                            </div>
                        )}
                        {activeModal === 'contact' && (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
                                <p style={{ fontSize: '13px', color: '#555', marginBottom: '5px' }}>For inquiries or opportunities, please get in touch.</p>
                                
                                <a 
                                    href="mailto:jamiejy927@gmail.com" 
                                    className="contact-link"
                                    style={{ fontSize: '16px', fontWeight: '700', color: '#111', textDecoration: 'none', cursor: 'pointer', transition: 'color 0.2s' }}
                                >
                                    Email
                                </a>
                                
                                <a 
                                    href="https://www.linkedin.com/in/eunjeong-yang-9248a33a8/" 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="contact-link"
                                    style={{ fontSize: '16px', fontWeight: '700', color: '#111', textDecoration: 'none', cursor: 'pointer', transition: 'color 0.2s' }}
                                >
                                    LinkedIn
                                </a>
                                
                                <a 
                                    href="https://github.com/jamiejy927" 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="contact-link"
                                    style={{ fontSize: '16px', fontWeight: '700', color: '#111', textDecoration: 'none', cursor: 'pointer', transition: 'color 0.2s' }}
                                >
                                    GitHub
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PixelWave;
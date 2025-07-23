import React, { useRef, useEffect } from 'react';

const STAR_COUNT = 120;
const STAR_COLOR = 'rgba(255,255,255,0.8)';
const STAR_SIZE = [0.7, 1.2, 1.8];
const STAR_BLUR = [0, 1, 2];
const STAR_SPEED = 0.15;

function randomBetween(a: number, b: number) {
  return a + Math.random() * (b - a);
}

interface Star {
  x: number;
  y: number;
  r: number;
  blur: number;
  speed: number;
  twinkle: number;
  twinkleDir: number;
}

const UniverseBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const stars = useRef<Star[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Generate stars
    stars.current = Array(STAR_COUNT).fill(0).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: STAR_SIZE[Math.floor(Math.random() * STAR_SIZE.length)],
      blur: STAR_BLUR[Math.floor(Math.random() * STAR_BLUR.length)],
      speed: randomBetween(0.05, STAR_SPEED),
      twinkle: randomBetween(0.5, 1),
      twinkleDir: Math.random() > 0.5 ? 1 : -1,
    }));

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      for (const star of stars.current) {
        ctx.save();
        ctx.globalAlpha = star.twinkle;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, 2 * Math.PI);
        ctx.shadowColor = STAR_COLOR;
        ctx.shadowBlur = star.blur;
        ctx.fillStyle = STAR_COLOR;
        ctx.fill();
        ctx.restore();

        // Move star
        star.y += star.speed;
        if (star.y > height) {
          star.x = Math.random() * width;
          star.y = 0;
        }
        // Twinkle
        star.twinkle += 0.01 * star.twinkleDir;
        if (star.twinkle > 1) star.twinkleDir = -1;
        if (star.twinkle < 0.5) star.twinkleDir = 1;
      }
      animationRef.current = requestAnimationFrame(draw);
    }

    draw();

    function handleResize() {
      width = window.innerWidth;
      height = window.innerHeight;
      if (canvas) {
        canvas.width = width;
        canvas.height = height;
      }
      // Re-generate stars for new size
      stars.current = Array(STAR_COUNT).fill(0).map(() => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: STAR_SIZE[Math.floor(Math.random() * STAR_SIZE.length)],
        blur: STAR_BLUR[Math.floor(Math.random() * STAR_BLUR.length)],
        speed: randomBetween(0.05, STAR_SPEED),
        twinkle: randomBetween(0.5, 1),
        twinkleDir: Math.random() > 0.5 ? 1 : -1,
      }));
    }
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
        background: 'linear-gradient(120deg, #0f2027 0%, #2c5364 100%)',
      }}
    />
  );
};

export default UniverseBackground; 
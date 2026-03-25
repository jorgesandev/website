"use client";

import React, { useRef, useEffect, useState } from "react";

interface Particle {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  vx: number;
  vy: number;
  length: number;
  baseAlpha: number;
  currentAlpha: number;
  delay: number;
}

export default function ParticlePortrait() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });
  const linesRef = useRef<Particle[]>([]);
  const imageLoadedRef = useRef(false);
  const startTimeRef = useRef<number>(0);
  const [size, setSize] = useState(400);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setSize(Math.floor(entry.contentRect.width));
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || size === 0) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const canvasWidth = size;
    const canvasHeight = size;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    let animationId: number;

    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = "/headshot.png";

    img.onload = () => {
      const offscreen = document.createElement("canvas");
      const offCtx = offscreen.getContext("2d");
      if (!offCtx) return;

      offscreen.width = canvasWidth;
      offscreen.height = canvasHeight;

      const scale = 0.85;
      const imgAspect = img.width / img.height;

      let drawHeight = canvasHeight * scale;
      let drawWidth = drawHeight * imgAspect;

      if (drawWidth > canvasWidth * scale) {
        drawWidth = canvasWidth * scale;
        drawHeight = drawWidth / imgAspect;
      }

      const offsetX = (canvasWidth - drawWidth) / 2;
      const offsetY = (canvasHeight - drawHeight) / 2;

      offCtx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
      const imageData = offCtx.getImageData(0, 0, canvasWidth, canvasHeight);
      const pixels = imageData.data;

      const lines: Particle[] = [];
      const rowGap = size <= 280 ? 4 : 5;

      for (let y = 0; y < canvasHeight; y += rowGap) {
        let x = 0;
        while (x < canvasWidth) {
          const i = (y * canvasWidth + x) * 4;
          const a = pixels[i + 3];

          if (a > 50) {
            const r = pixels[i];
            const g = pixels[i + 1];
            const b = pixels[i + 2];

            // Invert the brightness because we are drawing dark (Spice) ink on a light background.
            // Dark image pixels (hair/shirt) -> high invertedBrightness -> draw heavily.
            // Light image pixels (face) -> low invertedBrightness -> draw sparsely.
            const rawBrightness = (r + g + b) / (3 * 255);
            const brightness = 1 - rawBrightness;

            const lineLength = Math.floor(
              2 + brightness * (size <= 280 ? 4 : 7)
            );

            const scatterX = (Math.random() - 0.5) * 400;
            const scatterY = (Math.random() - 0.5) * 400;

            lines.push({
              x: x + scatterX,
              y: y + scatterY,
              targetX: x,
              targetY: y,
              vx: 0,
              vy: 0,
              length: lineLength,
              baseAlpha: 0.3 + brightness * 0.7,
              currentAlpha: 0,
              delay: Math.random() * 0.4,
            });

            x += lineLength + (size <= 280 ? 2 : 3);
          } else {
            x += 4;
          }
        }
      }

      linesRef.current = lines;
      imageLoadedRef.current = true;
      startTimeRef.current = performance.now();
    };

    const draw = () => {
      animationId = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      if (!imageLoadedRef.current) return;

      const lines = linesRef.current;
      const mouse = mouseRef.current;
      const elapsed = (performance.now() - startTimeRef.current) / 1000;

      ctx.lineCap = "butt";
      ctx.lineWidth = size <= 280 ? 2 : 2.5;

      lines.forEach((p) => {
        const particleTime = elapsed - p.delay;

        if (particleTime < 0) return;

        const fadeProgress = Math.min(particleTime / 1.5, 1);
        const easedFade = 1 - Math.pow(1 - fadeProgress, 2);
        p.currentAlpha = p.baseAlpha * easedFade;

        const moveProgress = Math.min(particleTime / 2.5, 1);
        const easedMove = 1 - Math.pow(1 - moveProgress, 3);

        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 100;

          if (dist < maxDist && dist > 0) {
            const force = (1 - dist / maxDist) * 3;
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
          }
        }

        const dx = p.targetX - p.x;
        const dy = p.targetY - p.y;

        const pullStrength = 0.015 + easedMove * 0.08;
        p.vx += dx * pullStrength;
        p.vy += dy * pullStrength;

        p.vx *= 0.88;
        p.vy *= 0.88;

        p.x += p.vx;
        p.y += p.vy;

        // Spice Orange: #995200 -> rgb(153, 82, 0)
        ctx.strokeStyle = `rgba(153, 82, 0, ${p.currentAlpha})`;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + p.length, p.y);
        ctx.stroke();
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
      mouseRef.current.active = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      mouseRef.current.x = touch.clientX - rect.left;
      mouseRef.current.y = touch.clientY - rect.top;
      mouseRef.current.active = true;
    };

    const handleLeave = () => {
      mouseRef.current.active = false;
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleLeave);
    canvas.addEventListener("touchmove", handleTouchMove, { passive: true });
    canvas.addEventListener("touchend", handleLeave);

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleLeave);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleLeave);
    };
  }, [size]);

  return (
    <div ref={containerRef} className="relative w-full aspect-square flex items-center justify-center">
      <canvas
        ref={canvasRef}
        className="simulation-container cursor-crosshair z-10"
        style={{ width: `${size}px`, height: `${size}px` }}
      />
    </div>
  );
}

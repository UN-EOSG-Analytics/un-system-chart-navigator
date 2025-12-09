"use client";

import { getCssColorVar } from "@/lib/utils";
import { useCallback, useEffect, useState } from "react";

interface Confetti {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  size: number;
  colorClass: string;
  borderRadius: string;
}

export default function UN80Animation() {
  const [confetti, setConfetti] = useState<Confetti[]>([]);

  const triggerConfetti = useCallback(() => {
    // UN System Chart colors using Tailwind color classes (dark variants)
    const colorClasses = [
      "bg-un-system-green-dark",
      "bg-un-system-red-dark",
      "bg-un-system-blue-dark",
      "bg-un-system-yellow-dark",
      "bg-un-system-purple-dark",
    ];

    const newConfetti: Confetti[] = [];
    const confettiCount = 200;

    for (let i = 0; i < confettiCount; i++) {
      newConfetti.push({
        id: Date.now() + i,
        x: Math.random() * window.innerWidth,
        y: -20 - Math.random() * 100,
        vx: (Math.random() - 0.5) * 2,
        vy: Math.random() * 3 + 2,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        size: Math.random() * 8 + 6,
        colorClass:
          colorClasses[Math.floor(Math.random() * colorClasses.length)],
        borderRadius: Math.random() > 0.5 ? "50%" : "0%",
      });
    }

    setConfetti(newConfetti);

    // Clear confetti after they fall
    setTimeout(() => {
      setConfetti([]);
    }, 5000);
  }, []);

  // Listen for "80" key sequence
  useEffect(() => {
    let keyBuffer: string[] = [];
    let timeoutId: NodeJS.Timeout;

    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't trigger if focus is on an input, textarea, select, or button
      const target = e.target as HTMLElement;
      const tagName = target.tagName.toLowerCase();
      if (
        tagName === "input" ||
        tagName === "textarea" ||
        tagName === "select" ||
        tagName === "button" ||
        target.isContentEditable
      ) {
        return;
      }

      keyBuffer = [...keyBuffer, e.key].slice(-2);

      if (keyBuffer.join("") === "80") {
        triggerConfetti();
        keyBuffer = [];
      }

      // Clear buffer after 1 second of no input
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        keyBuffer = [];
      }, 1000);
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
      clearTimeout(timeoutId);
    };
  }, [triggerConfetti]);

  // Animate confetti
  useEffect(() => {
    if (confetti.length === 0) return;

    const interval = setInterval(() => {
      setConfetti((prev) =>
        prev
          .map((c) => ({
            ...c,
            x: c.x + c.vx,
            y: c.y + c.vy,
            rotation: c.rotation + c.rotationSpeed,
            vy: c.vy + 0.1, // gravity
          }))
          .filter((c) => c.y < window.innerHeight + 50),
      );
    }, 1000 / 60); // 60 FPS

    return () => clearInterval(interval);
  }, [confetti.length]);

  if (confetti.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      {confetti.map((piece) => (
        <div
          key={piece.id}
          className="absolute"
          style={{
            left: `${piece.x}px`,
            top: `${piece.y}px`,
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            backgroundColor: getCssColorVar(piece.colorClass),
            opacity: 1,
            transform: `rotate(${piece.rotation}deg)`,
            borderRadius: piece.borderRadius,
          }}
        />
      ))}
    </div>
  );
}

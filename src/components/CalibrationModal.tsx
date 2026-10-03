import React, { useState, useEffect } from 'react';
import { X, Sparkles, CheckCircle2, RefreshCw, Hand } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio';

interface CalibrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  motionSensitivity: number;
  holdTimeToPop: number;
  mirrorCamera: boolean;
}

interface TestBubble {
  id: number;
  label: string;
  x: number;
  y: number;
  popped: boolean;
  progress: number;
  color: string;
}

export const CalibrationModal: React.FC<CalibrationModalProps> = ({
  isOpen,
  onClose,
  videoRef,
  motionSensitivity,
  holdTimeToPop,
  mirrorCamera
}) => {
  const [bubbles, setBubbles] = useState<TestBubble[]>([
    { id: 1, label: 'Burbuja Izquierda', x: 25, y: 35, popped: false, progress: 0, color: '#f43f5e' },
    { id: 2, label: 'Burbuja Centro', x: 50, y: 65, popped: false, progress: 0, color: '#06b6d4' },
    { id: 3, label: 'Burbuja Derecha', x: 75, y: 35, popped: false, progress: 0, color: '#10b981' }
  ]);

  const [motionEnergy, setMotionEnergy] = useState<number>(0);

  // Calibration loop
  useEffect(() => {
    if (!isOpen) return;

    let animId: number;
    const canvas = document.createElement('canvas');
    canvas.width = 160;
    canvas.height = 90;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    let prevFrame: ImageData | null = null;

    const loop = () => {
      const video = videoRef.current;
      if (video && video.readyState === 4 && ctx) {
        ctx.save();
        if (mirrorCamera) {
          ctx.scale(-1, 1);
          ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
        } else {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        }
        ctx.restore();

        const currentFrame = ctx.getImageData(0, 0, canvas.width, canvas.height);

        if (prevFrame) {
          const w = canvas.width;
          const h = canvas.height;
          let globalDiff = 0;
          const lastFrame = prevFrame;

          setBubbles(prevBubbles =>
            prevBubbles.map(bubble => {
              if (bubble.popped) return bubble;

              // Bounding box around bubble (percentage to canvas pixel coords)
              const bx = (bubble.x / 100) * w;
              const by = (bubble.y / 100) * h;
              const bRadius = (16 / 100) * w; // Approximate radius

              const minX = Math.max(0, Math.floor(bx - bRadius));
              const maxX = Math.min(w, Math.floor(bx + bRadius));
              const minY = Math.max(0, Math.floor(by - bRadius));
              const maxY = Math.min(h, Math.floor(by + bRadius));

              let diffPixels = 0;
              const totalPixels = Math.max(1, (maxX - minX) * (maxY - minY));

              for (let y = minY; y < maxY; y += 2) {
                for (let x = minX; x < maxX; x += 2) {
                  const idx = (y * w + x) * 4;
                  const rD = Math.abs(currentFrame.data[idx] - lastFrame.data[idx]);
                  const gD = Math.abs(currentFrame.data[idx + 1] - lastFrame.data[idx + 1]);
                  const bD = Math.abs(currentFrame.data[idx + 2] - lastFrame.data[idx + 2]);

                  if (rD + gD + bD > motionSensitivity) {
                    diffPixels++;
                    globalDiff++;
                  }
                }
              }

              const density = (diffPixels / (totalPixels / 4)) * 100;
              let nextProgress = bubble.progress;

              if (density > 12) {
                nextProgress += 0.05 / holdTimeToPop;
                sound.playChargeTick(nextProgress);
                if (nextProgress >= 1) {
                  sound.playPop();
                  confetti({
                    particleCount: 25,
                    origin: { x: bubble.x / 100, y: bubble.y / 100 }
                  });
                  return { ...bubble, popped: true, progress: 1 };
                }
              } else {
                nextProgress = Math.max(0, nextProgress - 0.06);
              }

              return { ...bubble, progress: nextProgress };
            })
          );

          setMotionEnergy(Math.min(100, Math.round(globalDiff / 10)));
        }

        prevFrame = currentFrame;
      }
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isOpen, motionSensitivity, holdTimeToPop, mirrorCamera, videoRef]);

  if (!isOpen) return null;

  const resetCalibrationBubbles = () => {
    setBubbles([
      { id: 1, label: 'Burbuja Izquierda', x: 25, y: 35, popped: false, progress: 0, color: '#f43f5e' },
      { id: 2, label: 'Burbuja Centro', x: 50, y: 65, popped: false, progress: 0, color: '#06b6d4' },
      { id: 3, label: 'Burbuja Derecha', x: 75, y: 35, popped: false, progress: 0, color: '#10b981' }
    ]);
  };

  const allPopped = bubbles.every(b => b.popped);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Hand className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white font-display">Calibración de Alcance y Burbujas</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-300">
          Ponte a 1 o 2 metros de la cámara y mueve la mano hacia las burbujas para explotarlas y comprobar tu rango de movimiento.
        </p>

        {/* Live Interactive Area */}
        <div className="relative aspect-video w-full rounded-2xl overflow-hidden border-2 border-slate-800 bg-slate-950 shadow-inner">
          
          {/* Bubbles Floating in Calibration Box */}
          {bubbles.map(b => (
            <div
              key={b.id}
              onClick={() => {
                sound.playPop();
                setBubbles(prev => prev.map(item => item.id === b.id ? { ...item, popped: true, progress: 1 } : item));
              }}
              style={{
                left: `${b.x}%`,
                top: `${b.y}%`,
                borderColor: b.color,
                boxShadow: b.progress > 0 ? `0 0 25px ${b.color}` : 'none'
              }}
              className={`
                absolute -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full border-2
                backdrop-blur-md flex flex-col items-center justify-center text-center p-2 cursor-pointer
                transition-all duration-200 select-none
                ${b.popped ? 'scale-0 opacity-0' : 'scale-100 opacity-100 bubble-glass animate-wobble'}
              `}
            >
              {/* Charge Circle */}
              <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none p-0.5" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke={b.color}
                  strokeWidth="4"
                  strokeDasharray={2 * Math.PI * 45}
                  strokeDashoffset={(2 * Math.PI * 45) - (b.progress * 2 * Math.PI * 45)}
                  strokeLinecap="round"
                />
              </svg>

              <span className="text-[11px] font-bold text-white leading-tight drop-shadow">
                {b.label}
              </span>
              <span className="text-[9px] text-cyan-200 mt-1">
                {b.progress > 0 ? `${Math.round(b.progress * 100)}%` : 'Toca o Mueve'}
              </span>
            </div>
          ))}

          {/* Success Overlay if all popped */}
          {allPopped && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-3 z-30 animate-in fade-in">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 animate-bounce" />
              <h4 className="text-xl font-bold text-white font-display">¡Calibración Excelente!</h4>
              <p className="text-xs text-slate-300 max-w-sm">
                Tu cámara detecta el movimiento y las burbujas responden con fluidez.
              </p>
              <button
                onClick={onClose}
                className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-2 px-6 rounded-xl text-xs transition shadow-lg shadow-emerald-500/20"
              >
                Listo para Jugar
              </button>
            </div>
          )}

          {/* Bottom Live Energy Gauge */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 text-[11px]">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Nivel de Movimiento en Escena:
            </span>
            <div className="flex items-center gap-2">
              <div className="w-24 bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-cyan-400 h-full transition-all duration-75"
                  style={{ width: `${Math.min(100, motionEnergy * 2)}%` }}
                />
              </div>
              <span className="font-mono-data text-cyan-300 font-bold">{motionEnergy}%</span>
            </div>
          </div>

        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={resetCalibrationBubbles}
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 px-3 py-2 rounded-xl border border-slate-700 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reiniciar Burbujas</span>
          </button>

          <button
            onClick={onClose}
            className="bg-cyan-500 hover:bg-cyan-400 text-white font-bold py-2 px-5 rounded-xl text-xs shadow-lg shadow-cyan-500/20 transition"
          >
            Cerrar Calibración
          </button>
        </div>

      </div>
    </div>
  );
};

import React from 'react';
import { BubbleState } from '../types';
import { Hand, Sparkles, Activity } from 'lucide-react';

interface FloatingBubbleProps {
  bubble: BubbleState;
  index: number;
  isSelected: boolean;
  isCorrectOption: boolean | null; // null if not revealed yet, true/false if answered
  isGameLocked: boolean;
  isCamActive: boolean;
  onPop: (index: number) => void;
}

export const FloatingBubble: React.FC<FloatingBubbleProps> = ({
  bubble,
  index,
  isSelected,
  isCorrectOption,
  isGameLocked,
  isCamActive,
  onPop,
}) => {
  const colorMap = {
    rose: {
      border: 'border-rose-400/80',
      ring: '#f43f5e',
      badgeBg: 'bg-rose-500',
      badgeText: 'text-white',
      glow: 'shadow-[0_0_30px_rgba(244,63,94,0.4)]',
      accent: 'text-rose-300',
      chargeStroke: '#f43f5e',
      shockwave: 'border-rose-400 shadow-[0_0_40px_#f43f5e]',
      aura: 'bg-rose-500/20 border-rose-500/40'
    },
    cyan: {
      border: 'border-cyan-400/80',
      ring: '#06b6d4',
      badgeBg: 'bg-cyan-500',
      badgeText: 'text-white',
      glow: 'shadow-[0_0_30px_rgba(6,182,212,0.4)]',
      accent: 'text-cyan-300',
      chargeStroke: '#06b6d4',
      shockwave: 'border-cyan-400 shadow-[0_0_40px_#06b6d4]',
      aura: 'bg-cyan-500/20 border-cyan-500/40'
    },
    amber: {
      border: 'border-amber-400/80',
      ring: '#f59e0b',
      badgeBg: 'bg-amber-500',
      badgeText: 'text-white',
      glow: 'shadow-[0_0_30px_rgba(245,158,11,0.4)]',
      accent: 'text-amber-300',
      chargeStroke: '#f59e0b',
      shockwave: 'border-amber-400 shadow-[0_0_40px_#f59e0b]',
      aura: 'bg-amber-500/20 border-amber-500/40'
    },
    emerald: {
      border: 'border-emerald-400/80',
      ring: '#10b981',
      badgeBg: 'bg-emerald-500',
      badgeText: 'text-white',
      glow: 'shadow-[0_0_30px_rgba(16,185,129,0.4)]',
      accent: 'text-emerald-300',
      chargeStroke: '#10b981',
      shockwave: 'border-emerald-400 shadow-[0_0_40px_#10b981]',
      aura: 'bg-emerald-500/20 border-emerald-500/40'
    }
  };

  const scheme = colorMap[bubble.color];

  // SVG Circular progress math
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (bubble.fillProgress * circumference);

  // Splatter particles coordinates generator
  const splatterParticles = [
    { tx: '-75px', ty: '-65px', size: 'w-3 h-3', delay: '0ms' },
    { tx: '75px', ty: '-65px', size: 'w-2.5 h-2.5', delay: '20ms' },
    { tx: '-85px', ty: '25px', size: 'w-3.5 h-3.5', delay: '10ms' },
    { tx: '90px', ty: '35px', size: 'w-3 h-3', delay: '30ms' },
    { tx: '-50px', ty: '80px', size: 'w-2 h-2', delay: '40ms' },
    { tx: '55px', ty: '85px', size: 'w-3 h-3', delay: '15ms' },
    { tx: '0px', ty: '-95px', size: 'w-3.5 h-3.5', delay: '5ms' },
    { tx: '0px', ty: '95px', size: 'w-2.5 h-2.5', delay: '25ms' },
    { tx: '-65px', ty: '-25px', size: 'w-2 h-2', delay: '35ms' },
    { tx: '65px', ty: '-25px', size: 'w-3 h-3', delay: '10ms' }
  ];

  // Determine visual state styles
  let stateClass = 'bubble-glass ' + scheme.border + ' ' + scheme.glow;
  if (isCorrectOption === true) {
    stateClass = 'bubble-glass-correct border-emerald-300 scale-105 shadow-[0_0_50px_rgba(16,185,129,0.8)]';
  } else if (isCorrectOption === false && isSelected) {
    stateClass = 'bubble-glass-wrong border-rose-300 scale-95 shadow-[0_0_50px_rgba(244,63,94,0.8)]';
  } else if ((bubble.isHovered || bubble.fillProgress > 0) && !isGameLocked) {
    stateClass = 'bubble-glass scale-105 ' + scheme.border + ' shadow-[0_0_45px_' + scheme.ring + '] ring-4 ring-white/30';
  }

  // Handle click fallback only if camera is inactive
  const handleBubbleClick = (e: React.MouseEvent | React.TouchEvent | React.KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isCamActive && !isGameLocked) {
      onPop(index);
    }
  };

  return (
    <div
      onClick={handleBubbleClick}
      onTouchStart={handleBubbleClick}
      role={!isCamActive ? 'button' : undefined}
      tabIndex={!isCamActive ? 0 : -1}
      onKeyDown={(e) => {
        if (!isCamActive && (e.key === 'Enter' || e.key === ' ') && !isGameLocked) {
          handleBubbleClick(e);
        }
      }}
      aria-label={`Opción ${bubble.letter}: ${bubble.text}`}
      className={`
        absolute z-20 transform -translate-x-1/2 -translate-y-1/2
        transition-all duration-300 ease-out select-none
        ${!bubble.isPopped ? bubble.animClass : 'pointer-events-none'}
        ${!isCamActive ? 'cursor-pointer active:scale-95' : 'cursor-default'}
      `}
      style={{
        left: `${bubble.xPercent}%`,
        top: `${bubble.yPercent}%`,
        width: 'min(195px, 32vw)',
        height: 'min(195px, 32vw)',
      }}
    >
      {/* REAL-TIME MOTION SENSOR AURA - Pulsates when camera detects hand/movement in this zone */}
      {bubble.motionIntensity > 5 && !bubble.isPopped && !isGameLocked && (
        <div
          className={`
            absolute -inset-4 rounded-full border-2 animate-ping pointer-events-none opacity-60
            ${scheme.aura}
          `}
          style={{ animationDuration: '1.2s' }}
        />
      )}

      {/* SHOCKWAVE EXPLOSION RING - Appears when popped by motion */}
      {bubble.isPopped && (
        <div
          className={`
            absolute inset-0 rounded-full border-4 animate-shockwave pointer-events-none
            ${isCorrectOption === true ? 'border-emerald-300 shadow-[0_0_50px_#10b981]' : (isCorrectOption === false ? 'border-rose-400 shadow-[0_0_50px_#f43f5e]' : scheme.shockwave)}
          `}
        />
      )}

      {/* FLYING SPLATTER PARTICLES & DROPLETS - Appears when popped */}
      {bubble.isPopped && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {splatterParticles.map((sp, pIdx) => (
            <div
              key={pIdx}
              className={`
                absolute rounded-full shadow-lg ${sp.size}
                ${isCorrectOption === true ? 'bg-emerald-400 shadow-emerald-400/80' : (isCorrectOption === false ? 'bg-rose-400 shadow-rose-400/80' : 'bg-cyan-300 shadow-cyan-400/80')}
              `}
              style={{
                '--tx': sp.tx,
                '--ty': sp.ty,
                animation: `splatter-fly 0.5s ease-out ${sp.delay} forwards`
              } as React.CSSProperties}
            />
          ))}
          {/* Central Flash Sparkle */}
          <div className="w-16 h-16 rounded-full bg-white/90 blur-sm animate-ping pointer-events-none" />
        </div>
      )}

      {/* 3D Floating Glass Sphere Body */}
      <div
        className={`
          relative w-full h-full rounded-full border-2 backdrop-blur-md
          flex flex-col items-center justify-center p-4 text-center
          transition-all duration-200
          ${bubble.isPopped ? 'animate-pop-explode' : 'animate-wobble ' + stateClass}
        `}
      >
        {/* Specular Highlight Arc (Gloss Reflection) */}
        <div className="absolute top-2 left-6 w-1/2 h-1/4 bg-gradient-to-b from-white/70 via-white/20 to-transparent rounded-full transform -rotate-15 pointer-events-none blur-[0.5px]" />
        
        {/* Secondary soft rim light */}
        <div className="absolute bottom-2 right-6 w-1/3 h-1/5 bg-gradient-to-t from-white/30 to-transparent rounded-full transform rotate-12 pointer-events-none" />

        {/* Circular Charging Ring (Motion Progress Gauge) */}
        <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none p-1" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.15)"
            strokeWidth="3.5"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={isCorrectOption === true ? '#34d399' : (isCorrectOption === false ? '#fb7185' : scheme.chargeStroke)}
            strokeWidth={bubble.fillProgress > 0 ? '5' : '3.5'}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-75 ease-linear"
          />
        </svg>

        {/* Bubble Option Content */}
        <div className="relative z-10 flex flex-col items-center justify-center space-y-1.5 max-w-[85%]">
          
          {/* Top Letter Badge + Motion Detector Badge */}
          <div className="flex items-center gap-1.5">
            <span
              className={`
                ${scheme.badgeBg} ${scheme.badgeText}
                text-xs sm:text-sm font-black px-2.5 py-0.5 rounded-full shadow-md
                flex items-center gap-1 font-display tracking-wider
              `}
            >
              <span>{bubble.letter}</span>
            </span>

            {/* Live Motion Sensor Progress percentage */}
            {bubble.fillProgress > 0 && !isGameLocked && (
              <span className="flex items-center text-[10px] text-white font-mono-data bg-slate-900/90 px-2 py-0.5 rounded-full border border-cyan-400/50 animate-pulse shadow-md">
                <Hand className="w-3 h-3 mr-1 text-cyan-300 animate-bounce" />
                <span className="font-bold text-cyan-300">{Math.round(bubble.fillProgress * 100)}%</span>
              </span>
            )}
          </div>

          {/* Option Answer Text */}
          <p className="text-xs sm:text-sm md:text-[15px] font-bold text-white leading-tight line-clamp-3 text-balance drop-shadow-md">
            {bubble.text}
          </p>

          {/* Live Sensor feedback prompt */}
          {bubble.fillProgress > 0 && !isGameLocked && (
            <span className="text-[10px] text-cyan-200 font-bold tracking-wide flex items-center gap-1 bg-slate-950/80 px-2 py-0.5 rounded-full border border-cyan-500/30">
              <Activity className="w-2.5 h-2.5 text-cyan-400 animate-pulse" />
              ¡Detectando Mano!
            </span>
          )}

          {bubble.fillProgress === 0 && isCamActive && !isGameLocked && (
            <span className="text-[9px] text-slate-300/80 font-medium tracking-wide flex items-center gap-0.5">
              <span>Mueve mano aquí</span>
            </span>
          )}
        </div>

        {/* Active tracking ring */}
        {bubble.fillProgress > 0 && !bubble.isPopped && (
          <div
            className="absolute -inset-2 rounded-full border-2 border-white/60 animate-pulse pointer-events-none"
            style={{ animationDuration: '0.8s' }}
          />
        )}
      </div>
    </div>
  );
};

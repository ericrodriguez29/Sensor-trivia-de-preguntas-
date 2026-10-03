import React from 'react';
import { Camera, Sparkles, Activity, Trophy, Heart, Flame, ShieldCheck, Play, Video } from 'lucide-react';
import { CATEGORIES } from '../data/questions';

interface StartScreenProps {
  selectedCategory: string;
  onSelectCategory: (catId: string) => void;
  onStartWithCamera: () => void;
  onStartManual: () => void;
  onOpenCalibration: () => void;
  isCameraSupported: boolean;
  isCamActive: boolean;
  onToggleCameraPreview?: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  selectedCategory,
  onSelectCategory,
  onStartWithCamera,
  onStartManual,
  onOpenCalibration,
  isCamActive,
  onToggleCameraPreview
}) => {
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Trophy': return <Trophy className="w-5 h-5 text-amber-400" />;
      case 'Activity': return <Activity className="w-5 h-5 text-emerald-400" />;
      case 'Heart': return <Heart className="w-5 h-5 text-sky-400" />;
      case 'Flame': return <Flame className="w-5 h-5 text-rose-400" />;
      default: return <Sparkles className="w-5 h-5 text-cyan-400" />;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-auto space-y-6 animate-in fade-in zoom-in-95 duration-300">
      
      {/* Hero Welcome Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-cyan-500/10 to-rose-500/10 blur-3xl pointer-events-none rounded-full" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Cámara en Vivo & Burbujas Flotantes</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white font-display leading-none">
              EDUFIT <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-rose-400">BUBBLE SENSOR</span>
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl leading-relaxed">
              Te verás en pantalla completa en vivo mientras las burbujas de respuesta flotan frente a ti. 
              Mueve los brazos o el cuerpo para alcanzar y reventar la burbuja correcta en tiempo real.
            </p>
          </div>

          {/* Floating Bubble Demo Preview Badge */}
          <div className="w-28 h-28 shrink-0 rounded-full border-2 border-cyan-400/80 bubble-glass flex flex-col items-center justify-center text-center p-2 shadow-[0_0_35px_rgba(6,182,212,0.4)] animate-float-1 animate-wobble">
            <span className="text-xs font-black text-cyan-300 font-display">EN VIVO</span>
            <span className="text-[10px] text-white font-bold">Detrás de las Burbujas</span>
          </div>
        </div>

        {/* 3 Steps Guide */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-800 text-xs">
          <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80 flex items-start gap-3">
            <div className="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs shrink-0">1</div>
            <div>
              <strong className="text-white block font-semibold">Cámara Activa</strong>
              <span className="text-slate-400 text-[11px]">Tu video en vivo se verá de fondo durante toda la partida.</span>
            </div>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80 flex items-start gap-3">
            <div className="w-7 h-7 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-xs shrink-0">2</div>
            <div>
              <strong className="text-white block font-semibold">Burbujas Flotantes</strong>
              <span className="text-slate-400 text-[11px]">Las respuestas flotan orgánicamente sobre tu imagen.</span>
            </div>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80 flex items-start gap-3">
            <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">3</div>
            <div>
              <strong className="text-white block font-semibold">Muévete y Explota</strong>
              <span className="text-slate-400 text-[11px]">Lleva tu mano a la burbuja para seleccionarla con tu movimiento.</span>
            </div>
          </div>
        </div>

      </div>

      {/* Category Selection Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 font-display">
          <span>Selecciona la Categoría de Trivia</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`
                  p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between space-y-2
                  ${isSelected
                    ? 'bg-slate-800/90 border-cyan-400 ring-2 ring-cyan-400/30 shadow-lg shadow-cyan-500/10'
                    : 'bg-slate-950/50 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                    {getCategoryIcon(cat.icon)}
                  </div>
                  {isSelected && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                      Seleccionada
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{cat.name}</h3>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{cat.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Launch Action Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        
        {/* Main Camera Start */}
        <button
          onClick={onStartWithCamera}
          className="w-full sm:flex-1 bg-gradient-to-r from-cyan-500 via-blue-600 to-rose-500 hover:from-cyan-400 hover:to-rose-400 text-white font-black py-4 px-8 rounded-2xl text-base shadow-xl shadow-cyan-500/25 transition transform active:scale-98 flex items-center justify-center gap-3"
        >
          <Camera className="w-5 h-5" />
          <span>ACTIVAR CÁMARA Y JUGAR EN VIVO</span>
        </button>

        {/* Calibration shortcut */}
        <button
          onClick={onOpenCalibration}
          className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-4 px-6 rounded-2xl text-xs sm:text-sm border border-slate-700 transition flex items-center justify-center gap-2"
        >
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span>Calibrar Burbujas</span>
        </button>

        {/* Manual Click/Touch Fallback */}
        <button
          onClick={onStartManual}
          className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white font-semibold py-4 px-5 rounded-2xl text-xs border border-slate-800 transition flex items-center justify-center gap-2"
        >
          <Play className="w-4 h-4" />
          <span>Modo Sin Cámara</span>
        </button>

      </div>

    </div>
  );
};

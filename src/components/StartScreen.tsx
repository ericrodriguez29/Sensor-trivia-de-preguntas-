import React from 'react';
import { Camera, Sparkles, Activity, Trophy, Heart, Flame, ShieldCheck, Play, Users, Swords, Globe } from 'lucide-react';
import { CATEGORIES } from '../data/questions';

interface StartScreenProps {
  selectedCategory: string;
  onSelectCategory: (catId: string) => void;
  onStartWithCamera: () => void;
  onStartManual: () => void;
  onOpenCalibration: () => void;
  onOpenMultiplayer: () => void;
  isCameraSupported: boolean;
  isCamActive: boolean;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  selectedCategory,
  onSelectCategory,
  onStartWithCamera,
  onStartManual,
  onOpenCalibration,
  onOpenMultiplayer,
  isCamActive
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
    <div className="w-full max-w-4xl mx-auto my-auto space-y-5 animate-in fade-in zoom-in-95 duration-300">
      
      {/* Hero Welcome Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-cyan-500/10 to-rose-500/10 blur-3xl pointer-events-none rounded-full" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Trivia Sensor en Vivo & Multijugador</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white font-display leading-none">
              EDUFIT <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-rose-400">BUBBLE SENSOR</span>
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl leading-relaxed">
              Juega en solitario, en duelo 1 vs 1 en la misma cámara, o en salas online con amigos. 
              Respuestas en burbujas flotantes sobre tu cámara en vivo.
            </p>
          </div>

          {/* Floating Bubble Demo Preview Badge */}
          <div className="w-28 h-28 shrink-0 rounded-full border-2 border-cyan-400/80 bubble-glass flex flex-col items-center justify-center text-center p-2 shadow-[0_0_35px_rgba(6,182,212,0.4)] animate-float-1 animate-wobble">
            <span className="text-xs font-black text-cyan-300 font-display">MULTIJUGADOR</span>
            <span className="text-[10px] text-white font-bold">¡Duelos en Vivo!</span>
          </div>
        </div>

        {/* 3 Game Modes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-800 text-xs">
          
          <button
            onClick={onStartWithCamera}
            className="bg-slate-950/70 hover:bg-slate-950 p-4 rounded-2xl border border-slate-800/80 hover:border-cyan-500/50 transition text-left space-y-1.5 group"
          >
            <div className="flex items-center justify-between">
              <div className="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs">
                <Play className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] text-cyan-400 font-mono-data font-bold">1 JUGADOR</span>
            </div>
            <strong className="text-white block font-semibold text-sm">Modo Individual</strong>
            <span className="text-slate-400 text-[11px] block leading-tight">Juega con tu cámara y supera tu propio récord.</span>
          </button>

          <button
            onClick={onOpenMultiplayer}
            className="bg-slate-950/70 hover:bg-slate-950 p-4 rounded-2xl border border-slate-800/80 hover:border-rose-500/50 transition text-left space-y-1.5 group"
          >
            <div className="flex items-center justify-between">
              <div className="w-7 h-7 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-xs">
                <Swords className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] text-rose-400 font-mono-data font-bold">1 VS 1 LOCAL</span>
            </div>
            <strong className="text-white block font-semibold text-sm">Duelo en Misma Cámara</strong>
            <span className="text-slate-400 text-[11px] block leading-tight">2 jugadores frente a la cámara compitiendo por reventar primero.</span>
          </button>

          <button
            onClick={onOpenMultiplayer}
            className="bg-slate-950/70 hover:bg-slate-950 p-4 rounded-2xl border border-slate-800/80 hover:border-emerald-500/50 transition text-left space-y-1.5 group"
          >
            <div className="flex items-center justify-between">
              <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                <Globe className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] text-emerald-400 font-mono-data font-bold">ONLINE</span>
            </div>
            <strong className="text-white block font-semibold text-sm">Salas Multijugador</strong>
            <span className="text-slate-400 text-[11px] block leading-tight">Crea o únete con código de sala en tiempo real.</span>
          </button>

        </div>

      </div>

      {/* Category Selection Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 font-display">
          <span>Selecciona la Categoría de Preguntas</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`
                  p-3.5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between space-y-1.5
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
                  <h3 className="text-xs sm:text-sm font-bold text-white">{cat.name}</h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-400 line-clamp-2 mt-0.5">{cat.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Action Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        
        {/* Main Camera Start (Solo) */}
        <button
          onClick={onStartWithCamera}
          className="w-full sm:flex-1 bg-gradient-to-r from-cyan-500 via-blue-600 to-rose-500 hover:from-cyan-400 hover:to-rose-400 text-white font-black py-4 px-8 rounded-2xl text-base shadow-xl shadow-cyan-500/25 transition transform active:scale-98 flex items-center justify-center gap-3"
        >
          <Camera className="w-5 h-5" />
          <span>INICIAR EN SOLITARIO</span>
        </button>

        {/* Multiplayer Lobby Button */}
        <button
          onClick={onOpenMultiplayer}
          className="w-full sm:w-auto bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-white font-bold py-4 px-6 rounded-2xl text-xs sm:text-sm shadow-xl shadow-rose-500/20 transition flex items-center justify-center gap-2"
        >
          <Users className="w-4 h-4" />
          <span>Menú Multijugador</span>
        </button>

        {/* Calibration shortcut */}
        <button
          onClick={onOpenCalibration}
          className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-4 px-5 rounded-2xl text-xs sm:text-sm border border-slate-700 transition flex items-center justify-center gap-2"
        >
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span>Calibrar</span>
        </button>

      </div>

    </div>
  );
};

import React from 'react';
import { Question, BubbleState, GameSettings, VersusPlayerState } from '../types';
import { FloatingBubble } from './FloatingBubble';
import { Clock, CheckCircle2, XCircle, Hand, Camera, FlipHorizontal, CameraOff, Swords, Trophy, Flame } from 'lucide-react';

interface SplitScreenVersusArenaProps {
  currentQuestion: Question;
  currentIndex: number;
  totalQuestions: number;
  timeLeft: number;
  maxTime: number;
  p1Bubbles: BubbleState[];
  p2Bubbles: BubbleState[];
  selectedAnswerIndex: number | null;
  roundWinnerPlayerId: string | null;
  isAnswered: boolean;
  versusPlayers: [VersusPlayerState, VersusPlayerState];
  roundWinnerMessage: string | null;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isCamActive: boolean;
  settings: GameSettings;
  onToggleCamera: () => void;
  onToggleMirror: () => void;
  onSelectOption: (index: number, playerSide: 'p1' | 'p2') => void;
}

export const SplitScreenVersusArena: React.FC<SplitScreenVersusArenaProps> = ({
  currentQuestion,
  currentIndex,
  totalQuestions,
  timeLeft,
  maxTime,
  p1Bubbles,
  p2Bubbles,
  selectedAnswerIndex,
  roundWinnerPlayerId,
  isAnswered,
  versusPlayers,
  roundWinnerMessage,
  videoRef,
  canvasRef,
  isCamActive,
  settings,
  onToggleCamera,
  onToggleMirror,
  onSelectOption,
}) => {
  const [p1, p2] = versusPlayers;
  const timerPercentage = Math.max(0, (timeLeft / maxTime) * 100);
  const isUrgent = timeLeft <= 5;

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-3 animate-in fade-in duration-200">
      
      {/* Top Question & Timer Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between gap-4 border-b border-slate-800/80 pb-2.5">
          <div className="flex items-center gap-2 text-xs">
            <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 font-black px-3 py-1 rounded-full font-mono-data uppercase tracking-wider flex items-center gap-1.5">
              <Swords className="w-3.5 h-3.5 text-rose-400" />
              <span>DUELO 1 VS 1 EN PANTALLA DIVIDIDA</span>
            </span>
            <span className="text-slate-400 font-semibold font-mono-data">
              Pregunta {currentIndex + 1} / {totalQuestions}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className={`w-4 h-4 ${isUrgent ? 'text-rose-500 animate-pulse' : 'text-amber-400'}`} />
            <span className={`text-xl sm:text-2xl font-black font-mono-data ${isUrgent ? 'text-rose-500 animate-pulse' : 'text-amber-400'}`}>
              {timeLeft}s
            </span>
          </div>
        </div>

        <h2 className="text-base sm:text-xl font-bold text-white mt-2.5 leading-snug font-display text-center text-balance">
          {currentQuestion.question}
        </h2>

        {/* Timer Bar */}
        <div className="w-full bg-slate-950 h-2 rounded-full mt-2.5 overflow-hidden border border-slate-800/80">
          <div
            className={`h-full transition-all duration-1000 ease-linear rounded-full ${
              isUrgent ? 'bg-gradient-to-r from-rose-500 to-amber-500' : 'bg-gradient-to-r from-cyan-400 via-rose-500 to-amber-400'
            }`}
            style={{ width: `${timerPercentage}%` }}
          />
        </div>
      </div>

      {/* SPLIT SCREEN ARENA: Left Side (Player 1) vs Right Side (Player 2) */}
      <div className="relative w-full aspect-[16/9] max-h-[620px] bg-slate-950 rounded-3xl overflow-hidden border-2 border-slate-800 shadow-2xl">
        
        {/* Hidden processing canvas for dual motion tracking */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Global Camera Feed spanning entire arena */}
        <video
          ref={videoRef}
          className={`w-full h-full object-cover brightness-105 contrast-105 ${settings.mirrorCamera ? 'mirror-video' : ''}`}
          playsInline
          autoPlay
          muted
        />

        {/* Camera Inactive Fallback */}
        {!isCamActive && (
          <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center z-10">
            <Swords className="w-12 h-12 text-rose-400 mb-2 animate-bounce" />
            <p className="text-base font-bold text-white font-display">Sensor de Pantalla Dividida Desactivado</p>
            <p className="text-xs text-slate-400 max-w-md mt-1">
              Activa la cámara para que ambos jugadores compitan con sus movimientos en pantalla dividida.
            </p>
            <button
              onClick={onToggleCamera}
              className="mt-4 bg-gradient-to-r from-cyan-500 to-rose-500 text-white font-bold py-2.5 px-6 rounded-xl text-xs flex items-center gap-2 shadow-lg transition"
            >
              <Camera className="w-4 h-4" />
              <span>Activar Cámara para Duelo</span>
            </button>
          </div>
        )}

        {/* Top Controls Overlay */}
        <div className="absolute top-3 left-4 right-4 z-40 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2 bg-slate-950/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700/80 pointer-events-auto">
            <span className={`w-2.5 h-2.5 rounded-full ${isCamActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
            <span className="text-[11px] font-bold text-slate-200 font-mono-data">Doble Sensor Activo</span>
          </div>

          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              onClick={onToggleMirror}
              className="p-2 rounded-full bg-slate-950/80 hover:bg-slate-850 backdrop-blur-md text-slate-300 border border-slate-700/80 transition text-xs shadow-md"
              title="Modo espejo"
            >
              <FlipHorizontal className="w-4 h-4 text-cyan-400" />
            </button>
            <button
              onClick={onToggleCamera}
              className={`p-2 rounded-full bg-slate-950/80 hover:bg-slate-850 backdrop-blur-md border transition text-xs shadow-md ${
                isCamActive ? 'text-emerald-400 border-emerald-500/40' : 'text-rose-400 border-rose-500/40'
              }`}
            >
              {isCamActive ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Central Vertical Neon Splitter Bar */}
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-1 bg-gradient-to-b from-cyan-400 via-white to-rose-500 shadow-[0_0_20px_rgba(255,255,255,0.8)] pointer-events-none z-30">
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-slate-950 border-2 border-white flex items-center justify-center text-xs font-black text-white shadow-2xl">
            VS
          </div>
        </div>

        {/* LEFT HALF: PLAYER 1 (AZUL / CYAN) */}
        <div className="absolute inset-y-0 left-0 w-1/2 border-r border-cyan-500/30 overflow-hidden">
          
          {/* P1 Top HUD Bar */}
          <div className="absolute top-12 left-3 right-3 z-30 flex items-center justify-between bg-cyan-950/85 border border-cyan-500/40 backdrop-blur-md px-3 py-2 rounded-2xl shadow-lg">
            <div className="flex items-center gap-2">
              <span className="text-xl">🔵</span>
              <div>
                <span className="text-xs font-black text-white block truncate max-w-[120px]">{p1.name}</span>
                <span className="text-[10px] text-cyan-300 font-mono-data flex items-center gap-1">
                  <Flame className="w-3 h-3 text-cyan-400" />
                  Racha: {p1.streak}x
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[9px] text-cyan-200 uppercase font-bold block">PUNTOS</span>
              <span className="text-lg sm:text-xl font-black text-cyan-400 font-mono-data">{p1.score}</span>
            </div>
          </div>

          {/* P1 Floating Bubbles Layer */}
          <div className="absolute inset-0 z-20 pointer-events-auto">
            {p1Bubbles.map((bubble, idx) => {
              const isSelected = selectedAnswerIndex === idx && roundWinnerPlayerId === p1.id;
              let isCorrectOption: boolean | null = null;
              if (isAnswered) {
                isCorrectOption = (idx === currentQuestion.correctIndex);
              }

              return (
                <FloatingBubble
                  key={`p1_${bubble.id}`}
                  bubble={bubble}
                  index={idx}
                  isSelected={isSelected}
                  isCorrectOption={isCorrectOption}
                  isGameLocked={isAnswered}
                  isCamActive={isCamActive}
                  onPop={(optIdx) => onSelectOption(optIdx, 'p1')}
                />
              );
            })}
          </div>

          {/* Left subtle tint */}
          <div className="absolute inset-0 bg-cyan-500/5 pointer-events-none" />
        </div>

        {/* RIGHT HALF: PLAYER 2 (ROJO / ROSE) */}
        <div className="absolute inset-y-0 right-0 w-1/2 border-l border-rose-500/30 overflow-hidden">
          
          {/* P2 Top HUD Bar */}
          <div className="absolute top-12 left-3 right-3 z-30 flex items-center justify-between bg-rose-950/85 border border-rose-500/40 backdrop-blur-md px-3 py-2 rounded-2xl shadow-lg">
            <div className="flex items-center gap-2">
              <span className="text-xl">🔴</span>
              <div>
                <span className="text-xs font-black text-white block truncate max-w-[120px]">{p2.name}</span>
                <span className="text-[10px] text-rose-300 font-mono-data flex items-center gap-1">
                  <Flame className="w-3 h-3 text-rose-400" />
                  Racha: {p2.streak}x
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[9px] text-rose-200 uppercase font-bold block">PUNTOS</span>
              <span className="text-lg sm:text-xl font-black text-rose-400 font-mono-data">{p2.score}</span>
            </div>
          </div>

          {/* P2 Floating Bubbles Layer */}
          <div className="absolute inset-0 z-20 pointer-events-auto">
            {p2Bubbles.map((bubble, idx) => {
              const isSelected = selectedAnswerIndex === idx && roundWinnerPlayerId === p2.id;
              let isCorrectOption: boolean | null = null;
              if (isAnswered) {
                isCorrectOption = (idx === currentQuestion.correctIndex);
              }

              return (
                <FloatingBubble
                  key={`p2_${bubble.id}`}
                  bubble={bubble}
                  index={idx}
                  isSelected={isSelected}
                  isCorrectOption={isCorrectOption}
                  isGameLocked={isAnswered}
                  isCamActive={isCamActive}
                  onPop={(optIdx) => onSelectOption(optIdx, 'p2')}
                />
              );
            })}
          </div>

          {/* Right subtle tint */}
          <div className="absolute inset-0 bg-rose-500/5 pointer-events-none" />
        </div>

        {/* Educational Feedback Callout when answered */}
        {isAnswered && (
          <div className="absolute bottom-4 left-6 right-6 z-50 bg-slate-900/95 border border-slate-700 backdrop-blur-md rounded-2xl p-4 shadow-2xl animate-in slide-in-from-bottom-4 duration-300 text-center">
            <div className="flex items-center justify-center gap-3">
              {roundWinnerPlayerId ? (
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shrink-0">
                  <Trophy className="w-6 h-6" />
                </div>
              ) : (
                <div className="p-2 rounded-xl bg-slate-800 text-slate-400 border border-slate-700 shrink-0">
                  <XCircle className="w-6 h-6" />
                </div>
              )}

              <div className="text-left">
                <span className="text-xs sm:text-sm font-black text-amber-400 font-display uppercase block">
                  {roundWinnerMessage || '¡Fin de la ronda!'}
                </span>
                <p className="text-xs text-slate-200 font-medium">
                  {currentQuestion.explanation}
                </p>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};

import React from 'react';
import { Question, BubbleState, GameSettings } from '../types';
import { FloatingBubble } from './FloatingBubble';
import { Clock, Sparkles, CheckCircle2, XCircle, Hand, Camera, FlipHorizontal, CameraOff, Activity } from 'lucide-react';

interface ActiveGameArenaProps {
  currentQuestion: Question;
  currentIndex: number;
  totalQuestions: number;
  timeLeft: number;
  maxTime: number;
  bubbles: BubbleState[];
  selectedAnswerIndex: number | null;
  isAnswered: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isCamActive: boolean;
  settings: GameSettings;
  onToggleCamera: () => void;
  onToggleMirror: () => void;
  onSelectOption: (index: number) => void;
}

export const ActiveGameArena: React.FC<ActiveGameArenaProps> = ({
  currentQuestion,
  currentIndex,
  totalQuestions,
  timeLeft,
  maxTime,
  bubbles,
  selectedAnswerIndex,
  isAnswered,
  videoRef,
  canvasRef,
  isCamActive,
  settings,
  onToggleCamera,
  onToggleMirror,
  onSelectOption,
}) => {
  const timerPercentage = Math.max(0, (timeLeft / maxTime) * 100);
  const isUrgent = timeLeft <= 5;

  // Active detected bubble
  const activeDetectedBubble = bubbles.find(b => b.fillProgress > 0.05);

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-4 animate-in fade-in duration-200">
      
      {/* Question Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-2xl relative overflow-hidden">
        
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-64 h-32 bg-cyan-500/10 blur-3xl pointer-events-none rounded-full" />

        <div className="flex items-center justify-between gap-4 border-b border-slate-800/80 pb-3">
          
          {/* Question Index & Category */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-black px-3 py-1 rounded-full font-mono-data uppercase tracking-wider">
              Pregunta {currentIndex + 1} / {totalQuestions}
            </span>
            <span className="text-slate-400 font-semibold flex items-center gap-1.5">
              <span>{currentQuestion.categoryIcon}</span>
              <span>{currentQuestion.category.replace('_', ' ').toUpperCase()}</span>
            </span>
          </div>

          {/* Stopwatch Countdown */}
          <div className="flex items-center gap-2">
            <Clock className={`w-4 h-4 ${isUrgent ? 'text-rose-500 animate-pulse' : 'text-amber-400'}`} />
            <span className={`text-xl sm:text-2xl font-black font-mono-data ${isUrgent ? 'text-rose-500 animate-pulse' : 'text-amber-400'}`}>
              {timeLeft}s
            </span>
          </div>

        </div>

        {/* Question Title */}
        <h2 className="text-base sm:text-xl md:text-2xl font-bold text-white mt-2.5 leading-snug font-display text-balance">
          {currentQuestion.question}
        </h2>

        {/* Animated Timer Progress Bar */}
        <div className="w-full bg-slate-950 h-2 rounded-full mt-3 overflow-hidden border border-slate-800/80">
          <div
            className={`h-full transition-all duration-1000 ease-linear rounded-full ${
              isUrgent ? 'bg-gradient-to-r from-rose-500 to-amber-500' : 'bg-gradient-to-r from-cyan-400 via-blue-500 to-emerald-400'
            }`}
            style={{ width: `${timerPercentage}%` }}
          />
        </div>

      </div>

      {/* Main Interactive Stage: Webcam Live Feed in Background + Floating Bubbles Layer in Foreground */}
      <div className="relative w-full aspect-[4/3] sm:aspect-video max-h-[600px] bg-slate-950 rounded-3xl overflow-hidden border-2 border-slate-800 shadow-2xl">
        
        {/* Hidden processing canvas for motion tracking computer vision */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Live Camera Video Stream - positioned directly behind the floating bubbles */}
        <video
          ref={videoRef}
          className={`w-full h-full object-cover brightness-105 contrast-105 transition-transform duration-300 ${settings.mirrorCamera ? 'mirror-video' : ''}`}
          playsInline
          autoPlay
          muted
        />

        {/* Visual Fallback if camera is inactive */}
        {!isCamActive && (
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 flex flex-col items-center justify-center p-6 text-center z-0">
            <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-3">
              <Sparkles className="w-8 h-8 animate-pulse" />
            </div>
            <p className="text-sm sm:text-base font-bold text-white font-display">Sensor de Cámara Desactivado</p>
            <p className="text-xs text-slate-400 max-w-sm mt-1">
              Para seleccionar respuestas usando únicamente tu movimiento físico frente a la cámara, actívala aquí:
            </p>
            <button
              onClick={onToggleCamera}
              className="mt-4 bg-cyan-500 hover:bg-cyan-400 text-white font-bold py-2.5 px-6 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition"
            >
              <Camera className="w-4 h-4" />
              <span>Activar Sensor de Movimiento por Cámara</span>
            </button>
          </div>
        )}

        {/* HUD Top Controls Overlay */}
        <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between pointer-events-none">
          
          {/* Status badge & live motion tracking detector */}
          <div className="flex items-center gap-2.5 bg-slate-950/85 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-700/80 pointer-events-auto shadow-md">
            <span className={`w-2.5 h-2.5 rounded-full ${isCamActive ? 'bg-emerald-400 animate-pulse shadow-[0_0_10px_#34d399]' : 'bg-slate-500'}`} />
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-200 font-mono-data">
              {isCamActive ? (
                <>
                  <Activity className="w-3 h-3 text-cyan-400 animate-pulse" />
                  <span>Sensor 100% Activo</span>
                  {activeDetectedBubble && (
                    <span className="text-cyan-300 ml-1 bg-cyan-500/20 px-2 py-0.2 rounded-md border border-cyan-500/30">
                      Burbuja [{activeDetectedBubble.letter}] ({Math.round(activeDetectedBubble.fillProgress * 100)}%)
                    </span>
                  )}
                </>
              ) : (
                <span>Sensor Inactivo</span>
              )}
            </div>
          </div>

          {/* Camera Quick Toggles */}
          <div className="flex items-center gap-2 pointer-events-auto">
            {isCamActive && (
              <button
                onClick={onToggleMirror}
                className="p-2 rounded-full bg-slate-950/80 hover:bg-slate-850 backdrop-blur-md text-slate-300 hover:text-white border border-slate-700/80 transition text-xs shadow-md"
                title={settings.mirrorCamera ? 'Desactivar modo espejo' : 'Activar modo espejo'}
              >
                <FlipHorizontal className="w-4 h-4 text-cyan-400" />
              </button>
            )}

            <button
              onClick={onToggleCamera}
              className={`p-2 rounded-full bg-slate-950/80 hover:bg-slate-850 backdrop-blur-md border transition text-xs shadow-md ${
                isCamActive ? 'text-emerald-400 border-emerald-500/40' : 'text-rose-400 border-rose-500/40'
              }`}
              title={isCamActive ? 'Apagar Sensor de Cámara' : 'Encender Sensor de Cámara'}
            >
              {isCamActive ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}
            </button>
          </div>

        </div>

        {/* Motion Sensor Guide Tooltip Banner */}
        {!isAnswered && isCamActive && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-slate-950/90 backdrop-blur-md px-4 py-2 rounded-full border border-cyan-500/40 text-xs text-cyan-300 font-semibold pointer-events-none shadow-xl">
            <Hand className="w-4 h-4 text-cyan-400 animate-bounce" />
            <span>Mueve tu mano hacia una burbuja para reventarla con tu movimiento</span>
          </div>
        )}

        {/* FLOATING BUBBLES LAYER - Rendered in front of the video */}
        <div className="absolute inset-0 z-20 pointer-events-auto">
          {bubbles.map((bubble, idx) => {
            const isSelected = selectedAnswerIndex === idx;
            let isCorrectOption: boolean | null = null;
            if (isAnswered) {
              isCorrectOption = (idx === currentQuestion.correctIndex);
            }

            return (
              <FloatingBubble
                key={bubble.id}
                bubble={bubble}
                index={idx}
                isSelected={isSelected}
                isCorrectOption={isCorrectOption}
                isGameLocked={isAnswered}
                isCamActive={isCamActive}
                onPop={onSelectOption}
              />
            );
          })}
        </div>

        {/* Educational Feedback Callout when answered */}
        {isAnswered && (
          <div className="absolute bottom-4 left-4 right-4 z-40 bg-slate-900/95 border border-slate-700 backdrop-blur-md rounded-2xl p-4 shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-start gap-3">
              {selectedAnswerIndex === currentQuestion.correctIndex ? (
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              ) : (
                <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40 shrink-0">
                  <XCircle className="w-6 h-6" />
                </div>
              )}

              <div className="space-y-1 text-left">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-black font-display tracking-wide uppercase ${
                    selectedAnswerIndex === currentQuestion.correctIndex ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {selectedAnswerIndex === currentQuestion.correctIndex ? '¡Respuesta Correcta! (+100 pts)' : '¡Respuesta Incorrecta!'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                  {currentQuestion.explanation}
                </p>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Manual fallback bar ONLY shown if camera is turned off */}
      {!isCamActive && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {bubbles.map((b, idx) => {
            const isSelected = selectedAnswerIndex === idx;
            const isCorrect = isAnswered && idx === currentQuestion.correctIndex;
            const isWrong = isAnswered && isSelected && !isCorrect;

            let btnBorder = 'border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300';
            if (isCorrect) btnBorder = 'border-emerald-500 bg-emerald-950/60 text-emerald-300';
            else if (isWrong) btnBorder = 'border-rose-500 bg-rose-950/60 text-rose-300';

            return (
              <button
                key={b.id}
                disabled={isAnswered}
                onClick={() => onSelectOption(idx)}
                className={`p-3 rounded-2xl border text-left transition text-xs font-semibold flex items-center gap-2.5 shadow-sm ${btnBorder}`}
              >
                <span className="w-6 h-6 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center font-bold text-white shrink-0 font-display">
                  {b.letter}
                </span>
                <span className="line-clamp-1">{b.text}</span>
              </button>
            );
          })}
        </div>
      )}

    </div>
  );
};

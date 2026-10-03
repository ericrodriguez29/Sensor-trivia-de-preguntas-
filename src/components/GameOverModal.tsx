import React from 'react';
import { Trophy, Flame, RotateCcw, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { Question, UserStats } from '../types';

interface GameOverModalProps {
  stats: UserStats;
  totalQuestions: number;
  questionHistory: Array<{ question: Question; userChoiceIndex: number; isCorrect: boolean }>;
  onRestart: () => void;
  onGoHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  totalQuestions,
  questionHistory,
  onRestart,
  onGoHome
}) => {
  const accuracy = Math.round((stats.correctCount / Math.max(1, totalQuestions)) * 100);

  // Performance title & medal
  let medalTitle = '¡Buen Esfuerzo!';
  let medalColor = 'text-cyan-400';
  let medalBadge = '🥉 Nivel Bronce';

  if (accuracy >= 90) {
    medalTitle = '¡Desempeño Legendario!';
    medalColor = 'text-amber-400';
    medalBadge = '🥇 Medalla de Oro Olímpica';
  } else if (accuracy >= 70) {
    medalTitle = '¡Gran Rendimiento Físico y Mental!';
    medalColor = 'text-slate-200';
    medalBadge = '🥈 Medalla de Plata';
  }

  return (
    <div className="w-full max-w-3xl mx-auto my-auto space-y-6 animate-in fade-in zoom-in-95 duration-300">
      
      {/* Top Banner Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center space-y-5 shadow-2xl relative overflow-hidden">
        
        {/* Glow backdrop */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-40 bg-cyan-500/10 blur-3xl pointer-events-none rounded-full" />

        <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto shadow-inner">
          <Trophy className={`w-10 h-10 ${medalColor}`} />
        </div>

        <div className="space-y-1">
          <span className="text-xs font-bold text-cyan-400 tracking-wider uppercase font-mono-data">
            {medalBadge}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white font-display">
            {medalTitle}
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto">
            Has completado la trivia deportiva reventando burbujas con tus movimientos físicos.
          </p>
        </div>

        {/* Primary Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80">
          
          <div className="text-center p-2">
            <span className="text-[11px] text-slate-400 font-semibold block">PUNTAJE</span>
            <span className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono-data">
              {stats.score.toLocaleString()}
            </span>
          </div>

          <div className="text-center p-2">
            <span className="text-[11px] text-slate-400 font-semibold block">PRECISIÓN</span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono-data">
              {accuracy}%
            </span>
          </div>

          <div className="text-center p-2">
            <span className="text-[11px] text-slate-400 font-semibold block">ACIERTOS</span>
            <span className="text-2xl sm:text-3xl font-black text-white font-mono-data">
              {stats.correctCount} / {totalQuestions}
            </span>
          </div>

          <div className="text-center p-2">
            <span className="text-[11px] text-slate-400 font-semibold block flex items-center justify-center gap-1">
              <Flame className="w-3 h-3 text-rose-500" />
              MEJOR RACHA
            </span>
            <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono-data">
              {stats.bestStreak}x
            </span>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={onRestart}
            className="flex-1 bg-gradient-to-r from-cyan-500 via-blue-600 to-rose-500 hover:from-cyan-400 hover:to-rose-400 text-white font-black py-3.5 px-6 rounded-2xl text-base shadow-xl shadow-cyan-500/20 transition flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            <span>JUGAR OTRA VEZ</span>
          </button>

          <button
            onClick={onGoHome}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-3.5 px-6 rounded-2xl text-sm border border-slate-700 transition"
          >
            Cambiar Categoría
          </button>
        </div>

      </div>

      {/* Question Review Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2 font-display">
          <span>Revisión Educativa de Preguntas</span>
          <span className="text-xs text-slate-400 font-mono-data">({questionHistory.length} respondidas)</span>
        </h3>

        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {questionHistory.map((item, idx) => (
            <div
              key={idx}
              className={`
                p-4 rounded-2xl border text-xs sm:text-sm space-y-2
                ${item.isCorrect ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-rose-950/20 border-rose-500/30'}
              `}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 font-semibold text-slate-200">
                  {item.isCorrect ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <span>{idx + 1}. {item.question.question}</span>
                </div>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shrink-0 ${item.isCorrect ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                  {item.isCorrect ? 'Correcta' : 'Incorrecta'}
                </span>
              </div>

              {/* Options recap */}
              <div className="text-[11px] text-slate-300 pl-6 space-y-1">
                <p>
                  <strong className="text-slate-400">Tu respuesta:</strong>{' '}
                  <span className={item.isCorrect ? 'text-emerald-300 font-bold' : 'text-rose-300 font-bold'}>
                    {item.userChoiceIndex >= 0 ? item.question.options[item.userChoiceIndex] : 'Tiempo agotado'}
                  </span>
                </p>
                {!item.isCorrect && (
                  <p>
                    <strong className="text-slate-400">Respuesta correcta:</strong>{' '}
                    <span className="text-emerald-300 font-bold">
                      {item.question.options[item.question.correctIndex]}
                    </span>
                  </p>
                )}
                <p className="text-slate-400 italic pt-1 border-t border-slate-800/80">
                  💡 {item.question.explanation}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

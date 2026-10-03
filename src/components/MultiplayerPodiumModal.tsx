import React from 'react';
import { Trophy, Flame, RotateCcw, Crown, ArrowRight, Swords } from 'lucide-react';
import { GameMode, OnlinePlayer, VersusPlayerState } from '../types';

interface MultiplayerPodiumModalProps {
  gameMode: GameMode;
  onlinePlayers?: OnlinePlayer[];
  versusPlayers?: [VersusPlayerState, VersusPlayerState];
  onRestart: () => void;
  onGoHome: () => void;
  isHost?: boolean;
}

export const MultiplayerPodiumModal: React.FC<MultiplayerPodiumModalProps> = ({
  gameMode,
  onlinePlayers = [],
  versusPlayers,
  onRestart,
  onGoHome,
  isHost
}) => {
  // Determine rankings
  let sortedPlayers: Array<{ name: string; avatar: string; score: number; color?: string; id?: string }> = [];

  if (gameMode === 'local_versus' && versusPlayers) {
    sortedPlayers = [...versusPlayers].sort((a, b) => b.score - a.score);
  } else if (gameMode === 'online_multiplayer' && onlinePlayers.length > 0) {
    sortedPlayers = [...onlinePlayers].sort((a, b) => b.score - a.score);
  }

  const winner = sortedPlayers[0];
  const isTie = sortedPlayers.length >= 2 && sortedPlayers[0].score === sortedPlayers[1].score;

  return (
    <div className="w-full max-w-3xl mx-auto my-auto space-y-6 animate-in fade-in zoom-in-95 duration-300">
      
      {/* Top Podium Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl relative overflow-hidden">
        
        {/* Glow backdrop */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-gradient-to-b from-amber-500/20 via-cyan-500/10 to-transparent blur-3xl pointer-events-none rounded-full" />

        <div className="w-24 h-24 rounded-full bg-amber-500/10 border-2 border-amber-400 flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(245,158,11,0.3)]">
          <Crown className="w-12 h-12 text-amber-400 animate-bounce" />
        </div>

        <div className="space-y-1">
          <span className="text-xs font-bold text-amber-400 tracking-wider uppercase font-mono-data">
            {gameMode === 'local_versus' ? 'Duelo 1 vs 1 Finalizado' : 'Podio Multijugador Online'}
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white font-display">
            {isTie ? '¡Empate Épico!' : `¡Victoria de ${winner?.name}!`}
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto">
            {isTie ? 'Ambos atletas obtuvieron exactamente el mismo puntaje.' : `Dominó la prueba de burbujas con ${winner?.score} puntos.`}
          </p>
        </div>

        {/* 3D Visual Podium */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end pt-4 max-w-lg mx-auto">
          
          {/* 2nd Place */}
          {sortedPlayers[1] ? (
            <div className="flex flex-col items-center space-y-2">
              <span className="text-2xl">{sortedPlayers[1].avatar || '🥈'}</span>
              <span className="text-xs font-bold text-slate-200 truncate max-w-[100px]">{sortedPlayers[1].name}</span>
              <div className="w-full bg-slate-800/90 border border-slate-700 h-24 rounded-2xl flex flex-col justify-center items-center p-2 shadow-inner">
                <span className="text-base font-black text-slate-300 font-mono-data">2º</span>
                <span className="text-xs font-bold text-cyan-300 font-mono-data">{sortedPlayers[1].score} pts</span>
              </div>
            </div>
          ) : <div />}

          {/* 1st Place */}
          {sortedPlayers[0] && (
            <div className="flex flex-col items-center space-y-2">
              <span className="text-3xl animate-bounce">{sortedPlayers[0].avatar || '👑'}</span>
              <span className="text-xs font-black text-amber-300 truncate max-w-[120px]">{sortedPlayers[0].name}</span>
              <div className="w-full bg-gradient-to-t from-amber-600/40 via-amber-500/20 to-amber-400/20 border-2 border-amber-400 h-32 rounded-2xl flex flex-col justify-center items-center p-2 shadow-[0_0_30px_rgba(245,158,11,0.3)]">
                <Trophy className="w-6 h-6 text-amber-400 mb-1" />
                <span className="text-lg font-black text-white font-mono-data">1º</span>
                <span className="text-xs font-bold text-amber-300 font-mono-data">{sortedPlayers[0].score} pts</span>
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {sortedPlayers[2] ? (
            <div className="flex flex-col items-center space-y-2">
              <span className="text-2xl">{sortedPlayers[2].avatar || '🥉'}</span>
              <span className="text-xs font-bold text-slate-200 truncate max-w-[100px]">{sortedPlayers[2].name}</span>
              <div className="w-full bg-slate-800/90 border border-slate-700 h-18 rounded-2xl flex flex-col justify-center items-center p-2 shadow-inner">
                <span className="text-sm font-black text-amber-600 font-mono-data">3º</span>
                <span className="text-xs font-bold text-cyan-300 font-mono-data">{sortedPlayers[2].score} pts</span>
              </div>
            </div>
          ) : <div />}

        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row gap-3 pt-3">
          <button
            onClick={onRestart}
            className="flex-1 bg-gradient-to-r from-amber-500 via-cyan-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-white font-black py-3.5 px-6 rounded-2xl text-base shadow-xl shadow-cyan-500/20 transition flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            <span>JUGAR REVANCHA</span>
          </button>

          <button
            onClick={onGoHome}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-3.5 px-6 rounded-2xl text-sm border border-slate-700 transition"
          >
            Menú Principal
          </button>
        </div>

      </div>

      {/* Full Leaderboard Table */}
      {sortedPlayers.length > 3 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tabla de Clasificación Completa</h3>
          <div className="space-y-2">
            {sortedPlayers.map((player, idx) => (
              <div
                key={player.id || idx}
                className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-mono-data text-xs text-slate-400 font-bold">#{idx + 1}</span>
                  <span className="text-xl">{player.avatar}</span>
                  <span className="text-xs font-bold text-white">{player.name}</span>
                </div>
                <span className="text-sm font-black text-cyan-400 font-mono-data">{player.score} pts</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

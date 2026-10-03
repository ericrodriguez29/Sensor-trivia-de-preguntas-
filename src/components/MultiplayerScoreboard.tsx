import React from 'react';
import { Trophy, Flame, Swords, Crown } from 'lucide-react';
import { GameMode, OnlinePlayer, VersusPlayerState } from '../types';

interface MultiplayerScoreboardProps {
  gameMode: GameMode;
  onlinePlayers?: OnlinePlayer[];
  versusPlayers?: [VersusPlayerState, VersusPlayerState];
  myPlayerId?: string;
}

export const MultiplayerScoreboard: React.FC<MultiplayerScoreboardProps> = ({
  gameMode,
  onlinePlayers = [],
  versusPlayers,
  myPlayerId
}) => {
  if (gameMode === 'solo') return null;

  if (gameMode === 'local_versus' && versusPlayers) {
    const [p1, p2] = versusPlayers;
    const isP1Winning = p1.score > p2.score;
    const isP2Winning = p2.score > p1.score;

    return (
      <div className="w-full max-w-5xl mx-auto grid grid-cols-2 gap-3 mb-2 animate-in fade-in">
        {/* Player 1 Card */}
        <div className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
          isP1Winning ? 'bg-cyan-950/50 border-cyan-400 shadow-md shadow-cyan-500/20' : 'bg-slate-900/80 border-slate-800'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center text-lg font-bold">
              🔵
            </div>
            <div>
              <span className="text-xs font-black text-white block truncate max-w-[120px]">{p1.name}</span>
              <span className="text-[10px] text-cyan-300 font-mono-data">Racha: {p1.streak}x</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block font-semibold">PUNTOS</span>
            <span className="text-xl sm:text-2xl font-black text-cyan-400 font-mono-data">{p1.score}</span>
          </div>
        </div>

        {/* Player 2 Card */}
        <div className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
          isP2Winning ? 'bg-rose-950/50 border-rose-400 shadow-md shadow-rose-500/20' : 'bg-slate-900/80 border-slate-800'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center text-lg font-bold">
              🔴
            </div>
            <div>
              <span className="text-xs font-black text-white block truncate max-w-[120px]">{p2.name}</span>
              <span className="text-[10px] text-rose-300 font-mono-data">Racha: {p2.streak}x</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block font-semibold">PUNTOS</span>
            <span className="text-xl sm:text-2xl font-black text-rose-400 font-mono-data">{p2.score}</span>
          </div>
        </div>
      </div>
    );
  }

  if (gameMode === 'online_multiplayer' && onlinePlayers.length > 0) {
    // Sort players by score
    const sorted = [...onlinePlayers].sort((a, b) => b.score - a.score);

    return (
      <div className="w-full max-w-5xl mx-auto bg-slate-900/90 border border-slate-800 rounded-2xl p-2.5 mb-2 backdrop-blur-md shadow-lg">
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-0.5">
          <div className="flex items-center gap-1.5 shrink-0 pr-2 border-r border-slate-800">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="text-[11px] font-bold text-slate-300 font-mono-data">En Vivo:</span>
          </div>

          <div className="flex items-center gap-3">
            {sorted.map((p, idx) => {
              const isMe = p.id === myPlayerId;
              return (
                <div
                  key={p.id}
                  className={`flex items-center gap-2 px-2.5 py-1 rounded-xl border text-xs shrink-0 transition ${
                    isMe ? 'bg-cyan-500/20 border-cyan-400/60 shadow-sm' : 'bg-slate-950/60 border-slate-800'
                  }`}
                >
                  <span className="font-mono-data font-bold text-[10px] text-slate-400">#{idx + 1}</span>
                  <span className="text-sm">{p.avatar}</span>
                  <span className="font-bold text-white max-w-[90px] truncate">{p.name} {isMe && '(Tú)'}</span>
                  <span className="font-black text-cyan-300 font-mono-data">{p.score}</span>
                  {p.hasAnsweredCurrent && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Ha respondido" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

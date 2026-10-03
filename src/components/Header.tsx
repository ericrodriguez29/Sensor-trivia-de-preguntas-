import React from 'react';
import { Volume2, VolumeX, Sliders, Trophy, Flame, Camera, Users, Globe, Swords } from 'lucide-react';
import { UserStats, GameMode, OnlineRoomState } from '../types';

interface HeaderProps {
  stats: UserStats;
  soundEnabled: boolean;
  gameMode: GameMode;
  onlineRoom: OnlineRoomState | null;
  onToggleSound: () => void;
  onOpenSettings: () => void;
  onOpenCalibration?: () => void;
  onOpenMultiplayer: () => void;
  isCamActive: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  stats,
  soundEnabled,
  gameMode,
  onlineRoom,
  onToggleSound,
  onOpenSettings,
  onOpenCalibration,
  onOpenMultiplayer,
  isCamActive
}) => {
  return (
    <header className="bg-slate-900/90 border-b border-slate-800 sticky top-0 z-40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
            <span className="font-display font-black text-xl tracking-tighter">EF</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg sm:text-xl font-black tracking-tight text-white font-display">
                EDUFIT <span className="text-cyan-400">BUBBLE SENSOR</span>
              </span>
              {onlineRoom && (
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono-data font-bold px-2 py-0.5 rounded-full">
                  SALA: {onlineRoom.code}
                </span>
              )}
            </div>
            <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400 font-medium">
              <span>{gameMode === 'solo' ? 'Modo Individual' : (gameMode === 'local_versus' ? 'Duelo Local 1 vs 1' : 'Multijugador Online')}</span>
              <span aria-hidden="true">·</span>
              <span>Sensor en Vivo</span>
            </div>
          </div>
        </div>

        {/* Zone 2: HUD Score & Streak Status (Solo Mode) or Mode indicator */}
        <div className="flex items-center gap-3 sm:gap-6">
          {gameMode === 'solo' ? (
            <>
              {/* Score Counter */}
              <div className="flex items-center gap-2 bg-slate-950/80 px-3.5 py-1.5 rounded-xl border border-slate-800 shadow-inner">
                <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
                <div className="leading-none">
                  <span className="text-[10px] text-slate-400 block font-semibold">PUNTOS</span>
                  <span className="text-sm sm:text-base font-black text-white font-mono-data">
                    {stats.score.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Streak Counter */}
              <div className="flex items-center gap-2 bg-slate-950/80 px-3.5 py-1.5 rounded-xl border border-slate-800 shadow-inner">
                <Flame className={`w-4 h-4 shrink-0 transition-colors ${stats.streak > 0 ? 'text-rose-500 animate-bounce' : 'text-slate-500'}`} />
                <div className="leading-none">
                  <span className="text-[10px] text-slate-400 block font-semibold">RACHA</span>
                  <span className={`text-sm sm:text-base font-black font-mono-data ${stats.streak > 0 ? 'text-cyan-400' : 'text-slate-400'}`}>
                    {stats.streak}x
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
              {gameMode === 'local_versus' ? (
                <>
                  <Swords className="w-4 h-4 text-rose-400" />
                  <span className="text-xs font-bold text-slate-200">Duelo 1 vs 1 en Pantalla</span>
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4 text-cyan-400 animate-pulse" />
                  <span className="text-xs font-bold text-slate-200">{onlineRoom?.players.length || 0} Jugadores Online</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Zone 3: Primary Utility Actions */}
        <div className="flex items-center gap-2">
          
          {/* Multiplayer Launcher */}
          <button
            onClick={onOpenMultiplayer}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 text-cyan-300 text-xs font-bold border border-cyan-500/40 transition shadow-sm"
            title="Abrir Menú Multijugador"
          >
            <Users className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Multijugador</span>
          </button>

          {isCamActive && onOpenCalibration && (
            <button
              onClick={onOpenCalibration}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
              title="Probar sensor de movimiento"
            >
              <Camera className="w-3.5 h-3.5 text-cyan-400" />
              <span>Calibrar</span>
            </button>
          )}

          <button
            onClick={onToggleSound}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
            title={soundEnabled ? 'Silenciar Efectos' : 'Activar Efectos'}
            aria-label={soundEnabled ? 'Silenciar Efectos' : 'Activar Efectos'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
            title="Ajustes de Sensor y Burbujas"
            aria-label="Ajustes de Sensor y Burbujas"
          >
            <Sliders className="w-4 h-4 text-cyan-400" />
          </button>

        </div>

      </div>
    </header>
  );
};

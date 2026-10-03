import React, { useState } from 'react';
import { X, Users, Globe, UserCheck, Play, Swords, Sparkles, Copy, Check } from 'lucide-react';
import { OnlineRoomState, GameMode } from '../types';
import { CATEGORIES } from '../data/questions';

interface MultiplayerLobbyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onlineRoom: OnlineRoomState | null;
  myPlayerId: string;
  isConnecting: boolean;
  onCreateOnlineRoom: (name: string, avatar: string, category: string) => void;
  onJoinOnlineRoom: (code: string, name: string, avatar: string) => void;
  onStartOnlineGame: () => void;
  onStartLocalVersus: (p1Name: string, p2Name: string) => void;
  onUpdateCategory: (cat: string) => void;
}

const AVATARS = ['🏃', '⚡', '🏀', '⚽', '🔥', '🥊', '🚴', '🤸', '🥇', '🦁'];

export const MultiplayerLobbyModal: React.FC<MultiplayerLobbyModalProps> = ({
  isOpen,
  onClose,
  onlineRoom,
  myPlayerId,
  isConnecting,
  onCreateOnlineRoom,
  onJoinOnlineRoom,
  onStartOnlineGame,
  onStartLocalVersus,
  onUpdateCategory
}) => {
  const [activeTab, setActiveTab] = useState<'create_online' | 'join_online' | 'local_versus'>('create_online');
  const [playerName, setPlayerName] = useState<string>('Atleta ' + Math.floor(10 + Math.random() * 90));
  const [selectedAvatar, setSelectedAvatar] = useState<string>('🏃');
  const [joinCode, setJoinCode] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Local Versus State
  const [p1Name, setP1Name] = useState<string>('Jugador 1 (Azul)');
  const [p2Name, setP2Name] = useState<string>('Jugador 2 (Rojo)');
  
  // Copy state
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isHost = onlineRoom && onlineRoom.hostId === myPlayerId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-display">Modo Multijugador</h3>
              <p className="text-xs text-slate-400">Juega en vivo con amigos online o en duelo local en la misma cámara</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* If inside an active Online Lobby Room */}
        {onlineRoom ? (
          <div className="space-y-5">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">CÓDIGO DE SALA ONLINE</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono-data tracking-widest">{onlineRoom.code}</span>
                  <button
                    onClick={() => handleCopyCode(onlineRoom.code)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition flex items-center gap-1 text-xs"
                    title="Copiar código"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copiado' : 'Copiar'}</span>
                  </button>
                </div>
              </div>

              {/* Host Category Selector */}
              {isHost ? (
                <div className="w-full sm:w-auto">
                  <label htmlFor="host-category-select" className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">Categoría</label>
                  <select
                    id="host-category-select"
                    value={onlineRoom.category}
                    onChange={(e) => onUpdateCategory(e.target.value)}
                    className="bg-slate-900 border border-slate-700 text-xs font-semibold text-white rounded-xl px-3 py-2 w-full"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Categoría</span>
                  <span className="text-xs font-bold text-white">
                    {CATEGORIES.find(c => c.id === onlineRoom.category)?.name || 'Mixto'}
                  </span>
                </div>
              )}
            </div>

            {/* Players in Room */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>Jugadores en Sala ({onlineRoom.players.length}/8)</span>
                <span className="text-emerald-400 flex items-center gap-1 font-mono-data text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Sincronizado
                </span>
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {onlineRoom.players.map((p) => (
                  <div
                    key={p.id}
                    className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800/80 flex items-center gap-2.5 relative"
                  >
                    <span className="text-2xl">{p.avatar}</span>
                    <div className="leading-tight overflow-hidden">
                      <span className="text-xs font-bold text-white block truncate">{p.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono-data">
                        {p.isHost ? '👑 Anfitrión' : 'Listo'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-2">
              {isHost ? (
                <button
                  onClick={onStartOnlineGame}
                  className="w-full bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-black py-3.5 px-6 rounded-2xl text-base shadow-xl shadow-emerald-500/20 transition flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  <span>COMENZAR PARTIDA MULTIJUGADOR</span>
                </button>
              ) : (
                <div className="bg-slate-950 p-3 rounded-2xl text-center border border-slate-800 text-xs text-slate-300 flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
                  <span>Esperando que el anfitrión inicie la partida...</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Lobby Selection Mode */
          <div className="space-y-4">
            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
              <button
                onClick={() => setActiveTab('create_online')}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  activeTab === 'create_online'
                    ? 'bg-cyan-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Crear Online</span>
              </button>

              <button
                onClick={() => setActiveTab('join_online')}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  activeTab === 'join_online'
                    ? 'bg-cyan-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Unirse Online</span>
              </button>

              <button
                onClick={() => setActiveTab('local_versus')}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  activeTab === 'local_versus'
                    ? 'bg-rose-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Swords className="w-3.5 h-3.5" />
                <span>Duelo 1 vs 1</span>
              </button>
            </div>

            {/* TAB 1: CREAR SALA ONLINE */}
            {activeTab === 'create_online' && (
              <div className="space-y-4 animate-in fade-in">
                {/* Player Nickname & Avatar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="create-player-name-input" className="text-xs font-bold text-slate-300 block mb-1">Tu Nombre o Apodo</label>
                    <input
                      id="create-player-name-input"
                      type="text"
                      maxLength={18}
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Elige tu Avatar</label>
                    <div className="flex gap-1.5 overflow-x-auto pb-1">
                      {AVATARS.map(av => (
                        <button
                          key={av}
                          onClick={() => setSelectedAvatar(av)}
                          className={`p-1.5 text-lg rounded-xl transition ${selectedAvatar === av ? 'bg-cyan-500/30 border border-cyan-400 scale-110' : 'bg-slate-950 hover:bg-slate-800'}`}
                        >
                          {av}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Category Selection */}
                <div>
                  <label htmlFor="create-category-select" className="text-xs font-bold text-slate-300 block mb-1">Categoría de Preguntas</label>
                  <select
                    id="create-category-select"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <button
                  disabled={isConnecting}
                  onClick={() => onCreateOnlineRoom(playerName, selectedAvatar, selectedCategory)}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-3 px-6 rounded-2xl text-xs shadow-lg shadow-cyan-500/20 transition flex items-center justify-center gap-2"
                >
                  <Globe className="w-4 h-4" />
                  <span>{isConnecting ? 'Creando Sala...' : 'Crear Sala y Generar Código'}</span>
                </button>
              </div>
            )}

            {/* TAB 2: UNIRSE A SALA ONLINE */}
            {activeTab === 'join_online' && (
              <div className="space-y-4 animate-in fade-in">
                <div>
                  <label htmlFor="join-code-input" className="text-xs font-bold text-slate-300 block mb-1">Código de la Sala (5 Caracteres)</label>
                  <input
                    id="join-code-input"
                    type="text"
                    placeholder="Ej. ABCD1"
                    maxLength={7}
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-base text-cyan-400 font-mono-data tracking-widest uppercase focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="join-player-name-input" className="text-xs font-bold text-slate-300 block mb-1">Tu Nombre o Apodo</label>
                    <input
                      id="join-player-name-input"
                      type="text"
                      maxLength={18}
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Tu Avatar</label>
                    <div className="flex gap-1.5 overflow-x-auto pb-1">
                      {AVATARS.map(av => (
                        <button
                          key={av}
                          onClick={() => setSelectedAvatar(av)}
                          className={`p-1.5 text-lg rounded-xl transition ${selectedAvatar === av ? 'bg-cyan-500/30 border border-cyan-400 scale-110' : 'bg-slate-950 hover:bg-slate-800'}`}
                        >
                          {av}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  disabled={!joinCode.trim() || isConnecting}
                  onClick={() => onJoinOnlineRoom(joinCode, playerName, selectedAvatar)}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold py-3 px-6 rounded-2xl text-xs shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>{isConnecting ? 'Conectando...' : 'Unirse a la Partida'}</span>
                </button>
              </div>
            )}

            {/* TAB 3: DUELO LOCAL 1 VS 1 EN LA MISMA CÁMARA */}
            {activeTab === 'local_versus' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-1">
                  <p className="font-bold text-white flex items-center gap-1.5">
                    <Swords className="w-4 h-4 text-rose-400" />
                    <span>Duelo 2 Jugadores frente a la misma cámara</span>
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Ambos jugadores se paran frente a la cámara. Quien mueva la mano y reviente primero la burbuja correcta suma los puntos de la ronda.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-2xl border border-cyan-500/40 bg-cyan-950/20 space-y-2">
                    <span className="text-xs font-bold text-cyan-300 flex items-center gap-1">
                      <span>🔵 Jugador 1 (Lado Izquierdo)</span>
                    </span>
                    <input
                      type="text"
                      value={p1Name}
                      onChange={(e) => setP1Name(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div className="p-3 rounded-2xl border border-rose-500/40 bg-rose-950/20 space-y-2">
                    <span className="text-xs font-bold text-rose-300 flex items-center gap-1">
                      <span>🔴 Jugador 2 (Lado Derecho)</span>
                    </span>
                    <input
                      type="text"
                      value={p2Name}
                      onChange={(e) => setP2Name(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>

                <button
                  onClick={() => onStartLocalVersus(p1Name, p2Name)}
                  className="w-full bg-gradient-to-r from-rose-500 via-amber-500 to-cyan-500 hover:from-rose-400 hover:to-cyan-400 text-white font-black py-3.5 px-6 rounded-2xl text-xs shadow-xl shadow-rose-500/20 transition flex items-center justify-center gap-2"
                >
                  <Swords className="w-4 h-4" />
                  <span>INICIAR DUELO 1 VS 1 EN CÁMARA</span>
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

import React from 'react';
import { X, Sliders, Shield, Zap, Sparkles, Volume2, Video } from 'lucide-react';
import { GameSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-display">Ajustes del Sensor & Burbujas</h3>
              <p className="text-xs text-slate-400">Personaliza la respuesta de la cámara y las animaciones</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5 text-sm">
          
          {/* Motion Sensitivity */}
          <div className="space-y-2 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
            <div className="flex justify-between items-center">
              <label htmlFor="motion-sens-range" className="font-semibold text-slate-200 flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span>Sensibilidad de Movimiento</span>
              </label>
              <span className="text-xs font-mono-data bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-md border border-cyan-500/30">
                {settings.motionSensitivity}
              </span>
            </div>
            <input
              id="motion-sens-range"
              type="range"
              min="10"
              max="50"
              step="2"
              value={settings.motionSensitivity}
              onChange={(e) => onUpdateSettings({ motionSensitivity: Number(e.target.value) })}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Alta (Espacios oscuros)</span>
              <span>Baja (Mucho movimiento)</span>
            </div>
          </div>

          {/* Hold time to pop */}
          <div className="space-y-2 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
            <div className="flex justify-between items-center">
              <label htmlFor="hold-time-range" className="font-semibold text-slate-200 flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-400" />
                <span>Tiempo para Explotar Burbuja</span>
              </label>
              <span className="text-xs font-mono-data bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-md border border-amber-500/30">
                {settings.holdTimeToPop.toFixed(1)}s
              </span>
            </div>
            <input
              id="hold-time-range"
              type="range"
              min="0.5"
              max="2.5"
              step="0.1"
              value={settings.holdTimeToPop}
              onChange={(e) => onUpdateSettings({ holdTimeToPop: Number(e.target.value) })}
              className="w-full accent-amber-400 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Tiempo requerido manteniendo la mano sobre la burbuja para seleccionarla y reventarla.
            </p>
          </div>

          {/* Bubble Float Speed / Style */}
          <div className="space-y-2 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
            <label className="font-semibold text-slate-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Flotación de las Burbujas</span>
            </label>
            <div className="grid grid-cols-3 gap-2 pt-1">
              {[
                { id: 'gentle', label: 'Suave' },
                { id: 'normal', label: 'Equilibrada' },
                { id: 'dynamic', label: 'Dinámica' },
              ].map((speed) => (
                <button
                  key={speed.id}
                  onClick={() => onUpdateSettings({ bubbleFloatSpeed: speed.id as 'gentle' | 'normal' | 'dynamic' })}
                  className={`
                    py-2 px-3 rounded-xl text-xs font-bold transition border
                    ${settings.bubbleFloatSpeed === speed.id
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
                    }
                  `}
                >
                  {speed.label}
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Mirror Camera */}
            <button
              onClick={() => onUpdateSettings({ mirrorCamera: !settings.mirrorCamera })}
              className={`
                p-3.5 rounded-2xl border flex items-center justify-between text-left transition
                ${settings.mirrorCamera ? 'bg-cyan-950/30 border-cyan-500/40 text-cyan-300' : 'bg-slate-950/50 border-slate-800 text-slate-400'}
              `}
            >
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4" />
                <span className="font-semibold text-xs">Modo Espejo</span>
              </div>
              <span className="text-[11px] font-bold uppercase">{settings.mirrorCamera ? 'Activo' : 'Inactivo'}</span>
            </button>

            {/* Sound FX */}
            <button
              onClick={() => onUpdateSettings({ soundEnabled: !settings.soundEnabled })}
              className={`
                p-3.5 rounded-2xl border flex items-center justify-between text-left transition
                ${settings.soundEnabled ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300' : 'bg-slate-950/50 border-slate-800 text-slate-400'}
              `}
            >
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4" />
                <span className="font-semibold text-xs">Efectos de Audio</span>
              </div>
              <span className="text-[11px] font-bold uppercase">{settings.soundEnabled ? 'Activo' : 'Mute'}</span>
            </button>

          </div>

        </div>

        {/* Footer */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-3 px-6 rounded-2xl text-sm shadow-lg shadow-cyan-500/20 transition"
          >
            Guardar y Continuar
          </button>
        </div>

      </div>
    </div>
  );
};

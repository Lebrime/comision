import React, { useState, useEffect } from 'react';
import { Waves, Database, BookOpen, Wifi, BatteryCharging, Smartphone, Monitor } from 'lucide-react';

interface Props {
  activeTab: 'aforo' | 'history' | 'guide';
  onTabChange: (tab: 'aforo' | 'history' | 'guide') => void;
  historyCount: number;
  children: React.ReactNode;
}

export const MobileFrame: React.FC<Props> = ({
  activeTab,
  onTabChange,
  historyCount,
  children,
}) => {
  const [isPhoneFrame, setIsPhoneFrame] = useState(false);
  const [currentTime, setCurrentTime] = useState('10:30');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start py-0 sm:py-6 px-0 sm:px-4 font-sans">
      {/* Barra superior de control de vista en pantallas de escritorio */}
      <div className="w-full max-w-lg hidden sm:flex items-center justify-between mb-3 px-2 text-xs text-slate-400">
        <div className="flex items-center gap-1.5 font-medium">
          <Waves className="w-4 h-4 text-cyan-400" />
          <span className="text-white font-bold">Aforo Hidráulico Móvil</span>
          <span className="text-slate-500">• Método del Flotador</span>
        </div>

        <button
          type="button"
          onClick={() => setIsPhoneFrame(!isPhoneFrame)}
          className="flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-800 transition-colors"
          title={isPhoneFrame ? 'Expandir a vista completa' : 'Ver en marco de smartphone'}
        >
          {isPhoneFrame ? (
            <>
              <Monitor className="w-3.5 h-3.5 text-cyan-400" />
              <span>Vista Amplia</span>
            </>
          ) : (
            <>
              <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
              <span>Modo Smartphone</span>
            </>
          )}
        </button>
      </div>

      {/* Contenedor tipo Smartphone o Full-Width adaptativo */}
      <div
        className={`w-full transition-all duration-300 flex flex-col ${
          isPhoneFrame
            ? 'max-w-[420px] bg-slate-950 border-4 border-slate-800 rounded-[42px] shadow-2xl shadow-cyan-950/20 overflow-hidden ring-1 ring-slate-700/50 my-auto min-h-[840px]'
            : 'max-w-xl sm:border sm:border-slate-800 sm:rounded-3xl sm:bg-slate-950/80 shadow-2xl'
        }`}
      >
        {/* Barra de Estado del Móvil (Notch / Hora / Batería) */}
        <div className="bg-slate-950 px-5 pt-3 pb-2 flex items-center justify-between text-xs text-slate-300 select-none border-b border-slate-900">
          <span className="font-semibold text-white tracking-tight">{currentTime}</span>
          
          {/* Cámara frontal simulada en modo teléfono */}
          {isPhoneFrame && (
            <div className="w-20 h-4 bg-slate-900 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-slate-950"></div>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-cyan-400">5G</span>
            <Wifi className="w-3.5 h-3.5 text-slate-300" />
            <div className="flex items-center gap-0.5 text-emerald-400">
              <span className="text-[10px] font-mono font-bold">98%</span>
              <BatteryCharging className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Barra de Título Superior de la App */}
        <div className="bg-slate-900/90 backdrop-blur px-4 py-3 border-b border-slate-800 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-sky-400 flex items-center justify-center shadow-lg shadow-cyan-950/60">
              <Waves className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-sm text-white leading-tight">
                Aforo por Flotador
              </h1>
              <p className="text-[10px] text-cyan-400 font-medium">
                Cálculo de Caudal & PDF
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              En Línea / Local
            </span>
          </div>
        </div>

        {/* Área de contenido principal con scroll independiente */}
        <div className="flex-1 overflow-y-auto px-3.5 sm:px-5 pt-4 pb-20">
          {children}
        </div>

        {/* Barra de Navegación Inferior Móvil (One-Thumb Navigation) */}
        <div className="bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-4 py-2 sticky bottom-0 z-40 flex items-center justify-around">
          {/* Botón Medición */}
          <button
            type="button"
            id="tab-btn-aforo"
            onClick={() => onTabChange('aforo')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all min-h-[44px] ${
              activeTab === 'aforo'
                ? 'text-cyan-400 font-bold scale-105'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Waves className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Aforo</span>
          </button>

          {/* Botón Base de Datos / Historial */}
          <button
            type="button"
            id="tab-btn-history"
            onClick={() => onTabChange('history')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all min-h-[44px] relative ${
              activeTab === 'history'
                ? 'text-cyan-400 font-bold scale-105'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Historial BD</span>
            {historyCount > 0 && (
              <span className="absolute top-0 right-2 w-4 h-4 rounded-full bg-cyan-600 text-white font-mono font-bold text-[9px] flex items-center justify-center shadow-md">
                {historyCount > 99 ? '99+' : historyCount}
              </span>
            )}
          </button>

          {/* Botón Guía Hidráulica */}
          <button
            type="button"
            id="tab-btn-guide"
            onClick={() => onTabChange('guide')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all min-h-[44px] ${
              activeTab === 'guide'
                ? 'text-cyan-400 font-bold scale-105'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Manual</span>
          </button>
        </div>
      </div>
    </div>
  );
};

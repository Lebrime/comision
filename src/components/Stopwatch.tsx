import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, PlusCircle, CheckCircle2, Volume2, VolumeX } from 'lucide-react';

interface Props {
  onAddReading: (timeSeconds: number) => void;
  currentCount: number;
  targetCount: number;
}

export const Stopwatch: React.FC<Props> = ({ onAddReading, currentCount, targetCount }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [flashFeedback, setFlashFeedback] = useState(false);

  const startTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const accumulatedTimeRef = useRef<number>(0);

  // Sintetizador simple de audio Web Audio API para feedback auditivo en campo
  const playBeep = useCallback((freq = 880, duration = 0.1) => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // AudioContext could be blocked by browser policy until interaction
    }
  }, [soundEnabled]);

  const triggerVibrate = useCallback(() => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(50);
    }
  }, []);

  const updateTimer = useCallback(() => {
    const now = performance.now();
    const currentElapsed = accumulatedTimeRef.current + (now - startTimeRef.current);
    setElapsedMs(currentElapsed);
    animationFrameRef.current = requestAnimationFrame(updateTimer);
  }, []);

  const handleStart = () => {
    playBeep(650, 0.08);
    triggerVibrate();
    startTimeRef.current = performance.now();
    setIsRunning(true);
    animationFrameRef.current = requestAnimationFrame(updateTimer);
  };

  const handlePause = () => {
    playBeep(450, 0.08);
    triggerVibrate();
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    accumulatedTimeRef.current = elapsedMs;
    setIsRunning(false);
  };

  const handleReset = () => {
    playBeep(350, 0.06);
    triggerVibrate();
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    accumulatedTimeRef.current = 0;
    setElapsedMs(0);
    setIsRunning(false);
  };

  const handleCaptureLap = () => {
    const timeInSeconds = Number((elapsedMs / 1000).toFixed(2));
    if (timeInSeconds <= 0) return;

    playBeep(980, 0.15);
    triggerVibrate();
    setFlashFeedback(true);
    setTimeout(() => setFlashFeedback(false), 300);

    onAddReading(timeInSeconds);

    // Opcional: reiniciar para la siguiente lectura de flotador
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    accumulatedTimeRef.current = 0;
    setElapsedMs(0);
    setIsRunning(false);
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Formato mm:ss.cc
  const totalSeconds = Math.floor(elapsedMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const centiseconds = Math.floor((elapsedMs % 1000) / 10);

  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(seconds).padStart(2, '0');
  const formattedCentis = String(centiseconds).padStart(2, '0');

  const isCompleted = currentCount >= targetCount && targetCount > 0;

  return (
    <div
      id="stopwatch-container"
      className={`rounded-2xl p-4 transition-all border ${
        flashFeedback
          ? 'bg-cyan-900/40 border-cyan-400 ring-2 ring-cyan-400/50'
          : 'bg-slate-950/90 border-slate-800'
      }`}
    >
      {/* Header del cronómetro */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            {isRunning && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            )}
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                isRunning ? 'bg-emerald-500' : 'bg-slate-600'
              }`}
            ></span>
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Cronómetro de Campo
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="text-slate-400 hover:text-slate-200 p-1 rounded transition-colors"
            title={soundEnabled ? 'Silenciar sonidos' : 'Activar sonido'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          <span
            className={`text-xs px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1 ${
              isCompleted
                ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50'
                : 'bg-cyan-950 text-cyan-300 border border-cyan-800/40'
            }`}
          >
            {isCompleted ? (
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            ) : null}
            Lectura {currentCount} de {targetCount}
          </span>
        </div>
      </div>

      {/* Pantalla digital gigante */}
      <div className="bg-slate-900/90 rounded-xl py-3 px-4 text-center border border-slate-800 shadow-inner mb-4">
        <div className="flex items-baseline justify-center font-mono font-bold tracking-tight">
          <span className="text-4xl sm:text-5xl text-slate-200">{formattedMinutes}</span>
          <span className="text-3xl sm:text-4xl text-cyan-400 mx-1">:</span>
          <span className="text-4xl sm:text-5xl text-white">{formattedSeconds}</span>
          <span className="text-3xl sm:text-4xl text-cyan-400 mx-1">.</span>
          <span className="text-3xl sm:text-4xl text-cyan-300">{formattedCentis}</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1 uppercase tracking-widest font-mono">
          minutos : segundos . centésimas
        </p>
      </div>

      {/* Controles del Cronómetro (Touch grande para guantes y campo) */}
      <div className="grid grid-cols-3 gap-2">
        {/* Iniciar / Pausar */}
        {!isRunning ? (
          <button
            type="button"
            id="btn-stopwatch-start"
            onClick={handleStart}
            className="col-span-1 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold py-3 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950/50 transition-all text-sm"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Iniciar</span>
          </button>
        ) : (
          <button
            type="button"
            id="btn-stopwatch-pause"
            onClick={handlePause}
            className="col-span-1 bg-amber-600 hover:bg-amber-500 active:scale-95 text-white font-bold py-3 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-amber-950/50 transition-all text-sm"
          >
            <Pause className="w-4 h-4 fill-white" />
            <span>Pausar</span>
          </button>
        )}

        {/* Capturar tiempo como lectura */}
        <button
          type="button"
          id="btn-stopwatch-lap"
          disabled={elapsedMs === 0}
          onClick={handleCaptureLap}
          className="col-span-1 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:pointer-events-none active:scale-95 text-white font-bold py-3 px-2 rounded-xl flex items-center justify-center gap-1 shadow-lg shadow-cyan-950/50 transition-all text-xs sm:text-sm text-center"
        >
          <PlusCircle className="w-4 h-4 shrink-0" />
          <span>Registrar</span>
        </button>

        {/* Reiniciar */}
        <button
          type="button"
          id="btn-stopwatch-reset"
          disabled={elapsedMs === 0 && !isRunning}
          onClick={handleReset}
          className="col-span-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none active:scale-95 text-slate-300 font-semibold py-3 px-3 rounded-xl flex items-center justify-center gap-1.5 border border-slate-700 transition-all text-sm"
        >
          <RotateCcw className="w-4 h-4 text-slate-400" />
          <span>Reset</span>
        </button>
      </div>
    </div>
  );
};

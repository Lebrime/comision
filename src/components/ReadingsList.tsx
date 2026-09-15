import React, { useState } from 'react';
import { TimeReading } from '../types';
import { Trash2, Plus, EyeOff, Eye, Clock } from 'lucide-react';

interface Props {
  readings: TimeReading[];
  distanceMeters: number;
  onAddManualReading: (seconds: number) => void;
  onToggleExclude: (id: string) => void;
  onDeleteReading: (id: string) => void;
  targetCount: number;
}

export const ReadingsList: React.FC<Props> = ({
  readings,
  distanceMeters,
  onAddManualReading,
  onToggleExclude,
  onDeleteReading,
  targetCount,
}) => {
  const [manualSeconds, setManualSeconds] = useState<string>('');

  const handleAddManual = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(manualSeconds);
    if (!isNaN(val) && val > 0) {
      onAddManualReading(Number(val.toFixed(2)));
      setManualSeconds('');
    }
  };

  const activeReadings = readings.filter(r => !r.isExcluded);

  return (
    <div id="readings-list-section" className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <h4 className="text-sm font-bold text-slate-200">
            Lecturas de Tiempo Registradas ({activeReadings.length}/{targetCount})
          </h4>
        </div>
        {readings.length > 0 && (
          <span className="text-[11px] text-slate-400 font-mono">
            Distancia tramo: {distanceMeters.toFixed(2)}m
          </span>
        )}
      </div>

      {/* Formulario rápido para ingreso manual de tiempo */}
      <form onSubmit={handleAddManual} className="flex gap-2">
        <div className="relative flex-1">
          <input
            id="manual-reading-input"
            type="number"
            step="0.01"
            min="0.1"
            max="600"
            placeholder="Ingresar tiempo manual (ej. 12.45)"
            value={manualSeconds}
            onChange={(e) => setManualSeconds(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
          />
          <span className="absolute right-3 top-2 text-xs text-slate-500">seg</span>
        </div>
        <button
          type="submit"
          id="btn-add-manual-reading"
          disabled={!manualSeconds || parseFloat(manualSeconds) <= 0}
          className="bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-cyan-300 font-semibold text-xs px-3 py-2 rounded-xl flex items-center gap-1 border border-slate-700 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Añadir</span>
        </button>
      </form>

      {/* Lista de lecturas */}
      {readings.length === 0 ? (
        <div className="bg-slate-900/50 border border-dashed border-slate-800 rounded-xl p-4 text-center text-slate-400">
          <p className="text-xs">
            No hay lecturas registradas aún. Presiona <strong className="text-cyan-400">"Iniciar"</strong> en el cronómetro o añade una manualmente arriba.
          </p>
        </div>
      ) : (
        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
          {readings.map((reading) => {
            const punctualVelocity =
              reading.timeSeconds > 0 && distanceMeters > 0
                ? (distanceMeters / reading.timeSeconds).toFixed(3)
                : '0.000';

            return (
              <div
                key={reading.id}
                className={`flex items-center justify-between p-2 rounded-xl border text-xs transition-all ${
                  reading.isExcluded
                    ? 'bg-slate-950/40 border-slate-800/60 opacity-50 line-through text-slate-500'
                    : 'bg-slate-900/80 border-slate-800 text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-[11px] text-cyan-400 shrink-0">
                    #{reading.index}
                  </span>
                  <div>
                    <div className="flex items-baseline gap-1.5 font-mono">
                      <span className="text-sm font-bold text-white">
                        {reading.timeSeconds.toFixed(2)} s
                      </span>
                      <span className="text-[11px] text-slate-400">
                        ({punctualVelocity} m/s)
                      </span>
                    </div>
                    {reading.timestamp && (
                      <p className="text-[10px] text-slate-500">{reading.timestamp}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {/* Botón excluir/activar lectura (para descartar atípicas) */}
                  <button
                    type="button"
                    onClick={() => onToggleExclude(reading.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                    title={reading.isExcluded ? 'Reactivar lectura' : 'Descartar lectura (atípica)'}
                  >
                    {reading.isExcluded ? (
                      <Eye className="w-3.5 h-3.5 text-amber-400" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {/* Botón eliminar */}
                  <button
                    type="button"
                    onClick={() => onDeleteReading(reading.id)}
                    className="p-1.5 rounded-lg text-rose-400/80 hover:text-rose-300 hover:bg-rose-950/40 transition-colors"
                    title="Eliminar lectura"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

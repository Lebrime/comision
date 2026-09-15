import React from 'react';
import { HydraulicCalculationResults } from '../types';
import { Download, Save, Check, Droplets, Gauge, Box, AlertCircle } from 'lucide-react';

interface Props {
  results: HydraulicCalculationResults;
  onSave: () => void;
  onExportPDF: () => void;
  isSaved: boolean;
  canCalculate: boolean;
}

export const AforoResultsCard: React.FC<Props> = ({
  results,
  onSave,
  onExportPDF,
  isSaved,
  canCalculate,
}) => {
  const hasData = results.readingsCount > 0 && results.dischargeLps > 0;

  // Calidad de la medición según coeficiente de variación (CV = sigma / promedio)
  let qualityLabel = 'Sin datos';
  let qualityColor = 'text-slate-400 bg-slate-800';

  if (hasData && results.averageTime > 0) {
    const cv = (results.stdDeviation / results.averageTime) * 100;
    if (cv <= 7) {
      qualityLabel = 'Excelente consistencia (CV < 7%)';
      qualityColor = 'text-emerald-400 bg-emerald-950/80 border-emerald-800';
    } else if (cv <= 15) {
      qualityLabel = 'Buena precisión (CV < 15%)';
      qualityColor = 'text-cyan-400 bg-cyan-950/80 border-cyan-800';
    } else {
      qualityLabel = 'Lecturas dispersas (CV > 15%)';
      qualityColor = 'text-amber-400 bg-amber-950/80 border-amber-800';
    }
  }

  return (
    <div
      id="results-summary-card"
      className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Droplets className="w-5 h-5 text-cyan-400" />
          <h3 className="font-bold text-base text-white">Resultados del Aforo</h3>
        </div>
        {hasData && (
          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${qualityColor}`}>
            {qualityLabel}
          </span>
        )}
      </div>

      {!canCalculate ? (
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 text-center text-slate-400 text-xs">
          <AlertCircle className="w-6 h-6 text-amber-500/80 mx-auto mb-2" />
          <p>Para calcular el aforo debes registrar al menos una lectura de tiempo y completar la geometría del canal (Espejo T y Tirante y mayores a 0).</p>
        </div>
      ) : (
        <>
          {/* Tarjeta principal de Caudal (Q) */}
          <div className="bg-gradient-to-br from-cyan-950/60 to-slate-950 border border-cyan-500/30 rounded-xl p-4 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none"></div>
            
            <p className="text-[11px] font-bold uppercase tracking-widest text-cyan-400">
              Caudal o Gasto Calculado (Q)
            </p>
            
            <div className="my-1 flex items-baseline justify-center gap-1.5">
              <span className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight font-mono">
                {results.dischargeLps.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-xl font-bold text-cyan-400">L/s</span>
            </div>

            <div className="flex items-center justify-center gap-3 text-xs text-slate-300 font-mono mt-1">
              <span>{results.dischargeM3s.toFixed(4)} m³/s</span>
              <span>•</span>
              <span>{results.dischargeM3h.toLocaleString('es-ES', { maximumFractionDigits: 1 })} m³/h</span>
            </div>
          </div>

          {/* Métricas secundarias */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                <span>Velocidad Media</span>
              </div>
              <p className="text-sm font-mono font-bold text-white">
                {results.meanVelocity.toFixed(4)} <span className="text-[11px] font-normal text-slate-400">m/s</span>
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Vsup: {results.surfaceVelocity.toFixed(3)} m/s
              </p>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <Box className="w-3.5 h-3.5 text-amber-400" />
                <span>Área Hidráulica</span>
              </div>
              <p className="text-sm font-mono font-bold text-white">
                {results.hydraulicArea.toFixed(4)} <span className="text-[11px] font-normal text-slate-400">m²</span>
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Rh: {results.hydraulicRadius.toFixed(3)} m
              </p>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 col-span-2 sm:col-span-1">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <Droplets className="w-3.5 h-3.5 text-emerald-400" />
                <span>Tiempo Promedio</span>
              </div>
              <p className="text-sm font-mono font-bold text-white">
                {results.averageTime.toFixed(2)} <span className="text-[11px] font-normal text-slate-400">s</span>
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                σ: ±{results.stdDeviation.toFixed(2)} s (N={results.readingsCount})
              </p>
            </div>
          </div>
        </>
      )}

      {/* Botones de acción principales para Móvil */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          type="button"
          id="btn-save-aforo"
          disabled={!hasData}
          onClick={onSave}
          className={`font-bold py-3 px-3 rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none ${
            isSaved
              ? 'bg-emerald-700/80 text-emerald-100 border border-emerald-600'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700'
          }`}
        >
          {isSaved ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4 text-cyan-400" />}
          <span>{isSaved ? 'Guardado en BD' : 'Guardar en BD'}</span>
        </button>

        <button
          type="button"
          id="btn-export-pdf"
          disabled={!hasData}
          onClick={onExportPDF}
          className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:pointer-events-none active:scale-95 text-white font-bold py-3 px-3 rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm shadow-lg shadow-cyan-950/60 transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Exportar PDF</span>
        </button>
      </div>
    </div>
  );
};

import React from 'react';
import { AforoRecord } from '../types';
import { X, Download, RotateCcw, Calendar, MapPin, User, FileText, Droplets } from 'lucide-react';
import { exportAforoToPDF } from '../utils/pdfGenerator';
import { CrossSectionViewer } from './CrossSectionViewer';

interface Props {
  aforo: AforoRecord | null;
  onClose: () => void;
  onLoadIntoForm: (aforo: AforoRecord) => void;
}

export const AforoDetailModal: React.FC<Props> = ({ aforo, onClose, onLoadIntoForm }) => {
  if (!aforo) return null;

  const handleExportPDF = () => {
    exportAforoToPDF(aforo);
  };

  const handleLoad = () => {
    onLoadIntoForm(aforo);
    onClose();
  };

  const formattedDate = new Date(aforo.createdAt).toLocaleString('es-ES', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div
        id="aforo-detail-modal"
        className="bg-slate-900 border border-slate-800 w-full max-w-lg max-h-[90vh] flex flex-col rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl"
      >
        {/* Header del modal */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800/60 px-2 py-0.5 rounded">
                {aforo.code}
              </span>
              <h3 className="font-bold text-base text-white truncate max-w-[200px] sm:max-w-xs">
                {aforo.channelName}
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formattedDate}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div className="p-4 overflow-y-auto space-y-4 text-xs">
          {/* Tarjeta de Caudal Principal */}
          <div className="bg-gradient-to-r from-cyan-950 to-slate-900 border border-cyan-500/30 rounded-xl p-4 text-center">
            <p className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">Caudal Total Obtenido</p>
            <div className="flex items-baseline justify-center gap-1 my-1 font-mono">
              <span className="text-4xl font-extrabold text-white">
                {aforo.results.dischargeLps.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-lg font-bold text-cyan-400">L/s</span>
            </div>
            <p className="text-xs text-slate-300 font-mono">
              {aforo.results.dischargeM3s.toFixed(4)} m³/s | {aforo.results.dischargeM3h.toLocaleString('es-ES', { maximumFractionDigits: 1 })} m³/h
            </p>
          </div>

          {/* Datos generales */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 space-y-2">
            <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">Información de Campo</h4>
            <div className="grid grid-cols-2 gap-2 text-slate-300">
              <div className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-slate-500 block">Ubicación / Sector</span>
                  <span className="font-medium">{aforo.sectorLocation || 'No indicada'}</span>
                </div>
              </div>
              <div className="flex items-start gap-1.5">
                <User className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-slate-500 block">Aforador</span>
                  <span className="font-medium">{aforo.operatorName || 'No indicado'}</span>
                </div>
              </div>
            </div>
            {aforo.notes && (
              <div className="pt-2 border-t border-slate-800/80 flex items-start gap-1.5 text-slate-400">
                <FileText className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                <p className="italic text-[11px]">{aforo.notes}</p>
              </div>
            )}
          </div>

          {/* Gráfico de la sección transversal */}
          <CrossSectionViewer geometry={aforo.geometry} sideSlopeZ={aforo.results.sideSlopeZ} />

          {/* Parámetros Hidráulicos */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-2.5">
              <span className="text-[10px] text-slate-400 block">Distancia tramo (L)</span>
              <span className="font-mono font-bold text-white text-sm">{aforo.distanceMeters.toFixed(2)} m</span>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-2.5">
              <span className="text-[10px] text-slate-400 block">Factor Corrección (K)</span>
              <span className="font-mono font-bold text-white text-sm">{aforo.correctionFactor.toFixed(2)}</span>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-2.5">
              <span className="text-[10px] text-slate-400 block">Velocidad Media (Vmed)</span>
              <span className="font-mono font-bold text-cyan-400 text-sm">{aforo.results.meanVelocity.toFixed(4)} m/s</span>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-2.5">
              <span className="text-[10px] text-slate-400 block">Área Hidráulica (A)</span>
              <span className="font-mono font-bold text-white text-sm">{aforo.results.hydraulicArea.toFixed(4)} m²</span>
            </div>
          </div>

          {/* Tabla de Lecturas de Tiempo */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
            <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[10px] mb-2 flex items-center justify-between">
              <span>Lecturas de Tiempo ({aforo.readings.length})</span>
              <span className="text-slate-400 font-mono">Promedio: {aforo.results.averageTime.toFixed(2)}s</span>
            </h4>
            <div className="space-y-1 max-h-36 overflow-y-auto">
              {aforo.readings.map((r) => (
                <div
                  key={r.id}
                  className={`flex justify-between items-center py-1 px-2 rounded font-mono text-[11px] ${
                    r.isExcluded ? 'bg-slate-900 text-slate-600 line-through' : 'bg-slate-900/80 text-slate-200'
                  }`}
                >
                  <span>Lectura #{r.index}</span>
                  <span className="font-bold">{r.timeSeconds.toFixed(2)} s</span>
                  <span className="text-slate-400">
                    {r.timeSeconds > 0 ? (aforo.distanceMeters / r.timeSeconds).toFixed(3) : 0} m/s
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Acciones inferiores del modal */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleLoad}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs transition-colors border border-slate-700"
          >
            <RotateCcw className="w-4 h-4 text-cyan-400" />
            <span>Cargar en Formulario</span>
          </button>

          <button
            type="button"
            onClick={handleExportPDF}
            className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs shadow-lg shadow-cyan-950/60 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Descargar PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};

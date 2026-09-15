import React, { useState, useMemo } from 'react';
import { AforoRecord } from '../types';
import { Search, Download, Trash2, RotateCcw, ExternalLink, Calendar, MapPin, Database, Plus, FileJson, AlertTriangle } from 'lucide-react';
import { exportAforoToPDF } from '../utils/pdfGenerator';

interface Props {
  records: AforoRecord[];
  onSelectAforo: (aforo: AforoRecord) => void;
  onLoadIntoForm: (aforo: AforoRecord) => void;
  onDeleteAforo: (id: string) => void;
  onClearAll: () => void;
  onNewAforo: () => void;
  onImportJSON: (records: AforoRecord[]) => void;
}

export const HistoryView: React.FC<Props> = ({
  records,
  onSelectAforo,
  onLoadIntoForm,
  onDeleteAforo,
  onClearAll,
  onNewAforo,
  onImportJSON,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const filteredRecords = useMemo(() => {
    if (!searchTerm.trim()) return records;
    const term = searchTerm.toLowerCase();
    return records.filter(
      (r) =>
        r.channelName.toLowerCase().includes(term) ||
        r.code.toLowerCase().includes(term) ||
        (r.sectorLocation && r.sectorLocation.toLowerCase().includes(term)) ||
        (r.operatorName && r.operatorName.toLowerCase().includes(term))
    );
  }, [records, searchTerm]);

  // Exportar copia local en JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(records, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Aforos_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Importar copia JSON
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          onImportJSON(imported);
        } else {
          alert('El archivo no contiene un formato de aforos válido.');
        }
      } catch (err) {
        alert('Error al leer el archivo JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div id="history-view" className="space-y-4 pb-12">
      {/* Encabezado y resumen estadístico */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-cyan-400" />
            <h2 className="font-bold text-base text-white">Base de Datos Local</h2>
          </div>
          <span className="text-xs bg-slate-800 text-cyan-300 font-mono font-bold px-2.5 py-0.5 rounded-full border border-slate-700">
            {records.length} {records.length === 1 ? 'Aforo' : 'Aforos'}
          </span>
        </div>

        {/* Barra de búsqueda */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            id="search-aforos-input"
            type="text"
            placeholder="Buscar por canal, sector, aforador o código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
        </div>

        {/* Acciones de respaldo */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportJSON}
              disabled={records.length === 0}
              className="text-slate-400 hover:text-cyan-300 flex items-center gap-1 disabled:opacity-40"
              title="Descargar copia de seguridad en archivo JSON"
            >
              <FileJson className="w-3.5 h-3.5" />
              <span>Copia JSON</span>
            </button>
            <label className="text-slate-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer">
              <input type="file" accept=".json" onChange={handleFileChange} className="hidden" />
              <span>Importar</span>
            </label>
          </div>

          {records.length > 0 && (
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="text-rose-400/80 hover:text-rose-300 text-[11px]"
            >
              Borrar todo
            </button>
          )}
        </div>
      </div>

      {/* Lista de Registros */}
      {filteredRecords.length === 0 ? (
        <div className="bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl p-8 text-center space-y-3">
          <Database className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-sm text-slate-300 font-semibold">No se encontraron aforos guardados</p>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            {searchTerm
              ? 'No hay registros que coincidan con la búsqueda.'
              : 'Realiza tu primer aforo en la pestaña de Medición para guardarlo aquí.'}
          </p>
          <button
            type="button"
            onClick={onNewAforo}
            className="mt-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl inline-flex items-center gap-1.5 shadow-lg shadow-cyan-950/60 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Aforo</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRecords.map((item) => {
            const formattedDate = new Date(item.createdAt).toLocaleDateString('es-ES', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            });

            return (
              <div
                key={item.id}
                id={`aforo-card-${item.id}`}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-3 hover:border-slate-700 transition-all"
              >
                {/* Cabecera de la tarjeta */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800/60 px-1.5 py-0.5 rounded">
                        {item.code}
                      </span>
                      <h3 className="font-bold text-sm text-white line-clamp-1">
                        {item.channelName}
                      </h3>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {formattedDate}
                      </span>
                      {item.sectorLocation && (
                        <span className="flex items-center gap-1 truncate max-w-[140px]">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          {item.sectorLocation}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Caudal destacado */}
                  <div className="text-right shrink-0">
                    <div className="text-lg font-extrabold text-white font-mono leading-none">
                      {item.results.dischargeLps.toLocaleString('es-ES', { maximumFractionDigits: 1 })}{' '}
                      <span className="text-xs text-cyan-400 font-bold">L/s</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {item.results.dischargeM3s.toFixed(3)} m³/s
                    </span>
                  </div>
                </div>

                {/* Métricas rápidas */}
                <div className="grid grid-cols-3 gap-1.5 text-center text-[11px] bg-slate-950/60 p-2 rounded-xl border border-slate-800/80">
                  <div>
                    <span className="text-[10px] text-slate-500 block">V. Media</span>
                    <span className="font-mono font-bold text-slate-300">
                      {item.results.meanVelocity.toFixed(2)} m/s
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Área</span>
                    <span className="font-mono font-bold text-slate-300">
                      {item.results.hydraulicArea.toFixed(3)} m²
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Lecturas</span>
                    <span className="font-mono font-bold text-slate-300">
                      {item.results.readingsCount} tomadas
                    </span>
                  </div>
                </div>

                {/* Botones de acción móvil */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onSelectAforo(item)}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1 font-medium transition-colors"
                      title="Ver detalle completo"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Detalle</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onLoadIntoForm(item)}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1 font-medium transition-colors"
                      title="Cargar valores en el formulario para editar"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                      <span>Cargar</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => exportAforoToPDF(item)}
                      className="bg-cyan-900/60 hover:bg-cyan-800 text-cyan-200 text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1 font-medium border border-cyan-700/50 transition-colors"
                      title="Descargar reporte oficial en PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>PDF</span>
                    </button>

                    {deleteConfirmId === item.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            onDeleteAforo(item.id);
                            setDeleteConfirmId(null);
                          }}
                          className="bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold px-2 py-1.5 rounded-lg transition-colors"
                        >
                          Sí, borrar
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(null)}
                          className="bg-slate-800 text-slate-400 text-[11px] px-1.5 py-1.5 rounded-lg"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(item.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors"
                        title="Eliminar este aforo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de confirmación para borrar toda la base de datos */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-base text-white">¿Borrar todos los aforos?</h3>
            </div>
            <p className="text-xs text-slate-300">
              Esta acción eliminará permanentemente todos los {records.length} registros guardados en la base de datos local de este dispositivo.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold py-2.5 rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onClearAll();
                  setShowClearConfirm(false);
                }}
                className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold py-2.5 rounded-xl shadow-lg shadow-rose-950"
              >
                Confirmar y Borrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

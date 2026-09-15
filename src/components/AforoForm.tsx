import React, { useState, useEffect } from 'react';
import { AforoRecord, ChannelGeometry, ChannelShape, TimeReading } from '../types';
import { calculateHydraulicResults, CORRECTION_FACTOR_PRESETS } from '../utils/calculations';
import { exportAforoToPDF } from '../utils/pdfGenerator';
import { Stopwatch } from './Stopwatch';
import { ReadingsList } from './ReadingsList';
import { CrossSectionViewer } from './CrossSectionViewer';
import { AforoResultsCard } from './AforoResultsCard';
import { Ruler, Waves, Sparkles, MapPin, User, FileText, Settings, RotateCcw } from 'lucide-react';

interface Props {
  onSaveToDB: (record: AforoRecord) => Promise<void>;
  initialAforo?: AforoRecord | null;
  onSavedSuccess?: () => void;
}

export const AforoForm: React.FC<Props> = ({ onSaveToDB, initialAforo, onSavedSuccess }) => {
  // Datos generales
  const [channelName, setChannelName] = useState<string>('Canal Principal');
  const [sectorLocation, setSectorLocation] = useState<string>('');
  const [operatorName, setOperatorName] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [code, setCode] = useState<string>('AF-001');

  // Parámetros de aforo
  const [distanceMeters, setDistanceMeters] = useState<number>(10.0);
  const [targetReadingsCount, setTargetReadingsCount] = useState<number>(5);
  const [correctionFactor, setCorrectionFactor] = useState<number>(0.85);
  const [presetIndex, setPresetIndex] = useState<number>(1);

  // Lecturas
  const [readings, setReadings] = useState<TimeReading[]>([
    { id: '1', index: 1, timeSeconds: 12.50, timestamp: '10:15:20' },
    { id: '2', index: 2, timeSeconds: 12.30, timestamp: '10:16:45' },
    { id: '3', index: 3, timeSeconds: 12.60, timestamp: '10:18:10' },
  ]);

  // Geometría
  const [geometry, setGeometry] = useState<ChannelGeometry>({
    shape: 'trapezoidal',
    waterSurfaceWidth: 1.20,
    waterDepth: 0.50,
    bottomWidth: 0.70,
  });

  // Estado de guardado
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Generar código autoincrementable o fecha
  useEffect(() => {
    if (!initialAforo) {
      const now = new Date();
      const codeStr = `AF-${now.getFullYear().toString().slice(2)}${String(now.getMonth() + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 900) + 100)}`;
      setCode(codeStr);
    }
  }, [initialAforo]);

  // Cargar aforo inicial si se solicita
  useEffect(() => {
    if (initialAforo) {
      setChannelName(initialAforo.channelName);
      setSectorLocation(initialAforo.sectorLocation || '');
      setOperatorName(initialAforo.operatorName || '');
      setNotes(initialAforo.notes || '');
      setCode(initialAforo.code || 'AF-001');
      setDistanceMeters(initialAforo.distanceMeters);
      setTargetReadingsCount(initialAforo.targetReadingsCount);
      setCorrectionFactor(initialAforo.correctionFactor);
      setGeometry(initialAforo.geometry);
      setReadings(initialAforo.readings);
      setIsSaved(true);
    }
  }, [initialAforo]);

  // Cálculos reactivos en tiempo real
  const results = calculateHydraulicResults(
    distanceMeters,
    readings,
    geometry,
    correctionFactor
  );

  // Handlers para cronómetro y lecturas
  const handleAddReading = (timeSeconds: number) => {
    const nextIndex = readings.length + 1;
    const newReading: TimeReading = {
      id: `${Date.now()}-${Math.random()}`,
      index: nextIndex,
      timeSeconds,
      timestamp: new Date().toLocaleTimeString('es-ES'),
    };
    setReadings([...readings, newReading]);
    setIsSaved(false);
  };

  const handleToggleExclude = (id: string) => {
    setReadings(
      readings.map((r) => (r.id === id ? { ...r, isExcluded: !r.isExcluded } : r))
    );
    setIsSaved(false);
  };

  const handleDeleteReading = (id: string) => {
    const updated = readings.filter((r) => r.id !== id);
    // Reindexar
    const reindexed = updated.map((r, idx) => ({ ...r, index: idx + 1 }));
    setReadings(reindexed);
    setIsSaved(false);
  };

  // Cambio de forma de sección
  const handleShapeChange = (shape: ChannelShape) => {
    if (shape === 'rectangular') {
      setGeometry({
        ...geometry,
        shape,
        bottomWidth: geometry.waterSurfaceWidth, // En rectangular b = T
      });
    } else if (shape === 'triangular') {
      setGeometry({
        ...geometry,
        shape,
        bottomWidth: 0, // En triangular b = 0
      });
    } else {
      setGeometry({
        ...geometry,
        shape,
        bottomWidth: geometry.bottomWidth === 0 || geometry.bottomWidth === geometry.waterSurfaceWidth
          ? Number((geometry.waterSurfaceWidth * 0.6).toFixed(2))
          : geometry.bottomWidth,
      });
    }
    setIsSaved(false);
  };

  // Cambio de Preset de Factor K
  const handlePresetSelect = (index: number) => {
    setPresetIndex(index);
    const selected = CORRECTION_FACTOR_PRESETS[index];
    if (selected && selected.name !== 'Personalizado') {
      setCorrectionFactor(selected.factor);
    }
    setIsSaved(false);
  };

  // Guardar en la Base de Datos Local
  const handleSave = async () => {
    const record: AforoRecord = {
      id: initialAforo?.id || `aforo-${Date.now()}`,
      code,
      createdAt: initialAforo?.createdAt || new Date().toISOString(),
      channelName: channelName.trim() || 'Canal Sin Nombre',
      sectorLocation: sectorLocation.trim(),
      operatorName: operatorName.trim(),
      notes: notes.trim(),
      distanceMeters,
      targetReadingsCount,
      correctionFactor,
      correctionFactorDescription: CORRECTION_FACTOR_PRESETS[presetIndex]?.name,
      readings,
      geometry,
      results,
    };

    await onSaveToDB(record);
    setIsSaved(true);
    setSaveToast('¡Aforo guardado correctamente en la Base de Datos Local!');
    setTimeout(() => setSaveToast(null), 3500);

    if (onSavedSuccess) {
      onSavedSuccess();
    }
  };

  // Exportar a PDF
  const handleExportPDF = () => {
    const record: AforoRecord = {
      id: initialAforo?.id || `aforo-${Date.now()}`,
      code,
      createdAt: initialAforo?.createdAt || new Date().toISOString(),
      channelName: channelName.trim() || 'Canal Sin Nombre',
      sectorLocation: sectorLocation.trim(),
      operatorName: operatorName.trim(),
      notes: notes.trim(),
      distanceMeters,
      targetReadingsCount,
      correctionFactor,
      readings,
      geometry,
      results,
    };
    exportAforoToPDF(record);
  };

  // Resetear todo a un aforo limpio
  const handleResetForm = () => {
    if (confirm('¿Deseas reiniciar los datos para un nuevo aforo?')) {
      const now = new Date();
      setCode(`AF-${now.getFullYear().toString().slice(2)}${String(now.getMonth() + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 900) + 100)}`);
      setChannelName('');
      setSectorLocation('');
      setNotes('');
      setReadings([]);
      setIsSaved(false);
    }
  };

  const canCalculate = readings.filter(r => !r.isExcluded).length > 0 && geometry.waterDepth > 0 && geometry.waterSurfaceWidth > 0;

  return (
    <div id="aforo-form-container" className="space-y-4 pb-16">
      {/* Toast de guardado */}
      {saveToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <Sparkles className="w-4 h-4" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* Header del Formulario */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800/60 px-2 py-0.5 rounded">
              {code}
            </span>
            <span className="text-xs text-slate-400 font-medium">Método del Flotador</span>
          </div>
          <h2 className="text-base font-bold text-white mt-1">Formulario de Aforo de Campo</h2>
        </div>

        <button
          type="button"
          onClick={handleResetForm}
          className="p-2 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded-xl transition-colors"
          title="Nuevo aforo en blanco"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* 1. DATOS GENERALES */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
          1. Datos de Identificación
        </h3>

        <div className="space-y-2.5">
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">
              Nombre del Canal o Fuente de Agua *
            </label>
            <input
              id="input-channel-name"
              type="text"
              placeholder="Ej. Canal Lateral 04, Río Seco, Acequia Alta"
              value={channelName}
              onChange={(e) => {
                setChannelName(e.target.value);
                setIsSaved(false);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mb-1">
                <MapPin className="w-3 h-3 text-cyan-400" />
                Ubicación / Sector / Progresiva
              </label>
              <input
                id="input-sector-location"
                type="text"
                placeholder="Ej. Km 3+250, Sector La Toma"
                value={sectorLocation}
                onChange={(e) => {
                  setSectorLocation(e.target.value);
                  setIsSaved(false);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mb-1">
                <User className="w-3 h-3 text-cyan-400" />
                Aforador / Técnico
              </label>
              <input
                id="input-operator-name"
                type="text"
                placeholder="Ej. Ing. Carlos Mendoza"
                value={operatorName}
                onChange={(e) => {
                  setOperatorName(e.target.value);
                  setIsSaved(false);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mb-1">
              <FileText className="w-3 h-3 text-slate-500" />
              Observaciones de Campo (Opcional)
            </label>
            <input
              id="input-notes"
              type="text"
              placeholder="Ej. Flujo uniforme, viento leve en contra, flotador de madera lastrado"
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                setIsSaved(false);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>
        </div>
      </div>

      {/* 2. PARÁMETROS DEL TRAMO & FACTOR K */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <Settings className="w-3.5 h-3.5 text-cyan-400" />
          2. Parámetros de Medición (Tramo y Factor K)
        </h3>

        <div className="grid grid-cols-2 gap-3">
          {/* Distancia del tramo L */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <label className="text-[11px] font-semibold text-slate-400 flex items-center justify-between mb-1">
              <span>Distancia del tramo (L) *</span>
              <span className="text-cyan-400 font-bold">metros</span>
            </label>
            <div className="relative">
              <input
                id="input-distance"
                type="number"
                step="0.1"
                min="1"
                max="100"
                value={distanceMeters || ''}
                onChange={(e) => {
                  setDistanceMeters(parseFloat(e.target.value) || 0);
                  setIsSaved(false);
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 font-mono font-bold text-white text-base focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
              <span className="absolute right-3 top-2.5 text-xs text-slate-500 font-mono">m</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Recomendado: 10m a 20m</p>
          </div>

          {/* Número de lecturas objetivo */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <label className="text-[11px] font-semibold text-slate-400 flex items-center justify-between mb-1">
              <span>N° de Lecturas *</span>
              <span className="text-cyan-400 font-bold">repeticiones</span>
            </label>
            <div className="relative">
              <input
                id="input-target-readings"
                type="number"
                step="1"
                min="1"
                max="20"
                value={targetReadingsCount || ''}
                onChange={(e) => {
                  setTargetReadingsCount(parseInt(e.target.value) || 1);
                  setIsSaved(false);
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 font-mono font-bold text-white text-base focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
              <span className="absolute right-3 top-2.5 text-xs text-slate-500 font-mono">veces</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Típico: 3 a 5 lecturas</p>
          </div>
        </div>

        {/* Factor de Corrección (K) */}
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-semibold text-slate-400">
              Factor de Corrección (K = Vmed / Vsup) *
            </label>
            <span className="font-mono font-extrabold text-cyan-300 text-sm bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              K = {correctionFactor.toFixed(2)}
            </span>
          </div>

          {/* Selector de presets según tipo de cauce */}
          <select
            id="select-correction-preset"
            value={presetIndex}
            onChange={(e) => handlePresetSelect(parseInt(e.target.value))}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          >
            {CORRECTION_FACTOR_PRESETS.map((preset, idx) => (
              <option key={idx} value={idx}>
                {preset.name} (K = {preset.factor.toFixed(2)})
              </option>
            ))}
          </select>

          {/* Input manual de K */}
          <div className="flex items-center gap-2 pt-1">
            <span className="text-[11px] text-slate-400">Ajuste fino manual:</span>
            <input
              id="input-correction-factor-manual"
              type="number"
              step="0.01"
              min="0.50"
              max="1.00"
              value={correctionFactor}
              onChange={(e) => {
                setCorrectionFactor(parseFloat(e.target.value) || 0.85);
                setPresetIndex(CORRECTION_FACTOR_PRESETS.length - 1);
                setIsSaved(false);
              }}
              className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs font-mono font-bold text-white text-center focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
            <span className="text-[10px] text-slate-500">(Común: 0.80 a 0.85)</span>
          </div>
        </div>
      </div>

      {/* 3. CRONÓMETRO DE CAMPO & LECTURAS */}
      <div className="space-y-3">
        <Stopwatch
          onAddReading={handleAddReading}
          currentCount={readings.filter((r) => !r.isExcluded).length}
          targetCount={targetReadingsCount}
        />

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <ReadingsList
            readings={readings}
            distanceMeters={distanceMeters}
            onAddManualReading={handleAddReading}
            onToggleExclude={handleToggleExclude}
            onDeleteReading={handleDeleteReading}
            targetCount={targetReadingsCount}
          />
        </div>
      </div>

      {/* 4. GEOMETRÍA DE LA SECCIÓN DEL CANAL */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Waves className="w-4 h-4 text-cyan-400" />
            3. Sección Transversal del Canal
          </h3>

          {/* Selector de forma */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              type="button"
              id="shape-trapezoidal-btn"
              onClick={() => handleShapeChange('trapezoidal')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                geometry.shape === 'trapezoidal'
                  ? 'bg-cyan-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Trapecial
            </button>
            <button
              type="button"
              id="shape-rectangular-btn"
              onClick={() => handleShapeChange('rectangular')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                geometry.shape === 'rectangular'
                  ? 'bg-cyan-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Rectangular
            </button>
            <button
              type="button"
              id="shape-triangular-btn"
              onClick={() => handleShapeChange('triangular')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                geometry.shape === 'triangular'
                  ? 'bg-cyan-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Triangular
            </button>
          </div>
        </div>

        {/* Inputs de dimensiones */}
        <div className="grid grid-cols-3 gap-2">
          {/* Espejo de agua (T) */}
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <label className="text-[10px] font-semibold text-cyan-400 block mb-1 truncate">
              Espejo Agua (T) *
            </label>
            <div className="relative">
              <input
                id="input-water-surface-t"
                type="number"
                step="0.01"
                min="0.05"
                max="50"
                value={geometry.waterSurfaceWidth || ''}
                onChange={(e) => {
                  const newT = parseFloat(e.target.value) || 0;
                  setGeometry({
                    ...geometry,
                    waterSurfaceWidth: newT,
                    bottomWidth: geometry.shape === 'rectangular' ? newT : geometry.bottomWidth,
                  });
                  setIsSaved(false);
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs font-mono font-bold text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
              <span className="absolute right-2 top-1.5 text-[10px] text-slate-500 font-mono">m</span>
            </div>
          </div>

          {/* Tirante de agua (y) */}
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <label className="text-[10px] font-semibold text-amber-400 block mb-1 truncate">
              Tirante (y) *
            </label>
            <div className="relative">
              <input
                id="input-water-depth-y"
                type="number"
                step="0.01"
                min="0.01"
                max="20"
                value={geometry.waterDepth || ''}
                onChange={(e) => {
                  setGeometry({
                    ...geometry,
                    waterDepth: parseFloat(e.target.value) || 0,
                  });
                  setIsSaved(false);
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs font-mono font-bold text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
              <span className="absolute right-2 top-1.5 text-[10px] text-slate-500 font-mono">m</span>
            </div>
          </div>

          {/* Base menor (b) */}
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <label className="text-[10px] font-semibold text-emerald-400 block mb-1 truncate">
              Base Menor (b) *
            </label>
            <div className="relative">
              <input
                id="input-bottom-width-b"
                type="number"
                step="0.01"
                min="0"
                max="50"
                disabled={geometry.shape === 'triangular' || geometry.shape === 'rectangular'}
                value={geometry.shape === 'rectangular' ? geometry.waterSurfaceWidth : geometry.shape === 'triangular' ? 0 : geometry.bottomWidth || ''}
                onChange={(e) => {
                  setGeometry({
                    ...geometry,
                    bottomWidth: parseFloat(e.target.value) || 0,
                  });
                  setIsSaved(false);
                }}
                className="w-full bg-slate-900 border border-slate-700 disabled:opacity-50 rounded-lg px-2 py-1.5 text-xs font-mono font-bold text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
              <span className="absolute right-2 top-1.5 text-[10px] text-slate-500 font-mono">m</span>
            </div>
          </div>
        </div>

        {/* Visualizador interactivo de la sección */}
        <CrossSectionViewer geometry={geometry} sideSlopeZ={results.sideSlopeZ} />
      </div>

      {/* 5. RESULTADOS Y ACCIONES */}
      <AforoResultsCard
        results={results}
        onSave={handleSave}
        onExportPDF={handleExportPDF}
        isSaved={isSaved}
        canCalculate={canCalculate}
      />
    </div>
  );
};

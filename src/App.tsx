import { useState, useEffect, useCallback } from 'react';
import { AforoRecord } from './types';
import { getAllAforos, saveAforo, deleteAforo, clearAllAforos, seedInitialSampleIfEmpty } from './utils/db';
import { MobileFrame } from './components/MobileFrame';
import { AforoForm } from './components/AforoForm';
import { HistoryView } from './components/HistoryView';
import { HydraulicGuide } from './components/HydraulicGuide';
import { AforoDetailModal } from './components/AforoDetailModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<'aforo' | 'history' | 'guide'>('aforo');
  const [records, setRecords] = useState<AforoRecord[]>([]);
  const [selectedAforo, setSelectedAforo] = useState<AforoRecord | null>(null);
  const [aforoToEdit, setAforoToEdit] = useState<AforoRecord | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Cargar registros de la base de datos local
  const loadRecords = useCallback(async () => {
    try {
      await seedInitialSampleIfEmpty();
      const all = await getAllAforos();
      setRecords(all);
    } catch (err) {
      console.error('Error cargando aforos de la base de datos:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  // Guardar en base de datos local
  const handleSaveToDB = async (record: AforoRecord) => {
    await saveAforo(record);
    await loadRecords();
  };

  // Eliminar un aforo
  const handleDeleteAforo = async (id: string) => {
    await deleteAforo(id);
    await loadRecords();
    if (selectedAforo && selectedAforo.id === id) {
      setSelectedAforo(null);
    }
  };

  // Borrar todos los aforos
  const handleClearAll = async () => {
    await clearAllAforos();
    setRecords([]);
    setSelectedAforo(null);
  };

  // Cargar registro seleccionado en el formulario principal
  const handleLoadIntoForm = (aforo: AforoRecord) => {
    setAforoToEdit({ ...aforo, id: `aforo-${Date.now()}` }); // Generar nuevo ID para permitir guardar como copia o actualización
    setActiveTab('aforo');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Importar copia de registros JSON
  const handleImportJSON = async (imported: AforoRecord[]) => {
    for (const item of imported) {
      await saveAforo(item);
    }
    await loadRecords();
    alert(`Se importaron ${imported.length} aforos a la base de datos local con éxito.`);
  };

  return (
    <MobileFrame
      activeTab={activeTab}
      onTabChange={setActiveTab}
      historyCount={records.length}
    >
      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-400">Iniciando base de datos local de aforos...</p>
        </div>
      ) : (
        <>
          {activeTab === 'aforo' && (
            <AforoForm
              onSaveToDB={handleSaveToDB}
              initialAforo={aforoToEdit}
              onSavedSuccess={() => {
                // Notificación opcional o mantener en formulario
              }}
            />
          )}

          {activeTab === 'history' && (
            <HistoryView
              records={records}
              onSelectAforo={(aforo) => setSelectedAforo(aforo)}
              onLoadIntoForm={handleLoadIntoForm}
              onDeleteAforo={handleDeleteAforo}
              onClearAll={handleClearAll}
              onNewAforo={() => {
                setAforoToEdit(null);
                setActiveTab('aforo');
              }}
              onImportJSON={handleImportJSON}
            />
          )}

          {activeTab === 'guide' && <HydraulicGuide />}
        </>
      )}

      {/* Modal de detalle */}
      <AforoDetailModal
        aforo={selectedAforo}
        onClose={() => setSelectedAforo(null)}
        onLoadIntoForm={handleLoadIntoForm}
      />
    </MobileFrame>
  );
}

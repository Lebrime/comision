import { AforoRecord } from '../types';

const DB_NAME = 'AforoFlotadorDB';
const DB_VERSION = 1;
const STORE_NAME = 'aforos';
const LOCAL_STORAGE_KEY = 'aforo_flotador_records';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB no está soportado en este navegador.'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('createdAt', 'createdAt', { unique: false });
        store.createIndex('channelName', 'channelName', { unique: false });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

// Fallback a LocalStorage para garantizar soporte 100% en cualquier iframe o navegador
function getFromLocalStorage(): AforoRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error leyendo de localStorage:', e);
    return [];
  }
}

function saveToLocalStorage(records: AforoRecord[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(records));
  } catch (e) {
    console.error('Error guardando en localStorage:', e);
  }
}

export async function getAllAforos(): Promise<AforoRecord[]> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const results = (request.result as AforoRecord[]) || [];
        // Ordenar del más reciente al más antiguo
        results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        // Sincronizar respaldo en localStorage
        saveToLocalStorage(results);
        resolve(results);
      };

      request.onerror = () => {
        console.warn('Fallo IndexedDB getAll, usando localStorage');
        resolve(getFromLocalStorage());
      };
    });
  } catch (err) {
    console.warn('Error abriendo IndexedDB, usando localStorage fallback:', err);
    const records = getFromLocalStorage();
    records.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return records;
  }
}

export async function getAforoById(id: string): Promise<AforoRecord | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => {
        if (request.result) {
          resolve(request.result);
        } else {
          const local = getFromLocalStorage().find(r => r.id === id) || null;
          resolve(local);
        }
      };

      request.onerror = () => {
        const local = getFromLocalStorage().find(r => r.id === id) || null;
        resolve(local);
      };
    });
  } catch (err) {
    console.warn('Error en getAforoById, recurriendo a localStorage:', err);
    return getFromLocalStorage().find(r => r.id === id) || null;
  }
}

export async function saveAforo(record: AforoRecord): Promise<void> {
  // Primero actualizar respaldo en localStorage
  const current = getFromLocalStorage();
  const index = current.findIndex(r => r.id === record.id);
  if (index >= 0) {
    current[index] = record;
  } else {
    current.unshift(record);
  }
  saveToLocalStorage(current);

  // Luego persistir en IndexedDB
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.put(record);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('IndexedDB no disponible, guardado realizado con éxito en localStorage:', err);
  }
}

export async function deleteAforo(id: string): Promise<void> {
  // Eliminar de localStorage
  const current = getFromLocalStorage().filter(r => r.id !== id);
  saveToLocalStorage(current);

  // Eliminar de IndexedDB
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('Error eliminando en IndexedDB:', err);
  }
}

export async function clearAllAforos(): Promise<void> {
  saveToLocalStorage([]);
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('Error limpiando IndexedDB:', err);
  }
}

// Ejemplo demostrativo inicial si la base de datos está vacía
export async function seedInitialSampleIfEmpty(): Promise<void> {
  const existing = await getAllAforos();
  if (existing.length === 0) {
    const sampleRecord: AforoRecord = {
      id: 'demo-sample-01',
      code: 'AF-2026-001',
      createdAt: new Date().toISOString(),
      channelName: 'Canal Principal Margen Derecha',
      sectorLocation: 'Km 3+450 - Toma Lateral 2',
      operatorName: 'Ing. Hidráulico de Campo',
      notes: 'Aforo realizado en horas de la mañana con flujo estable y tiempo despejado. Flotador cilíndrico de madera sumergido en 2/3 de profundidad.',
      distanceMeters: 10.0,
      targetReadingsCount: 5,
      correctionFactor: 0.85,
      correctionFactorDescription: 'Canal de concreto con paredes lisas',
      geometry: {
        shape: 'trapezoidal',
        waterSurfaceWidth: 1.40,
        waterDepth: 0.55,
        bottomWidth: 0.80,
      },
      readings: [
        { id: 'r1', index: 1, timeSeconds: 12.45, timestamp: new Date(Date.now() - 3600000).toLocaleTimeString() },
        { id: 'r2', index: 2, timeSeconds: 12.20, timestamp: new Date(Date.now() - 3300000).toLocaleTimeString() },
        { id: 'r3', index: 3, timeSeconds: 12.65, timestamp: new Date(Date.now() - 3000000).toLocaleTimeString() },
        { id: 'r4', index: 4, timeSeconds: 12.10, timestamp: new Date(Date.now() - 2700000).toLocaleTimeString() },
        { id: 'r5', index: 5, timeSeconds: 12.50, timestamp: new Date(Date.now() - 2400000).toLocaleTimeString() },
      ],
      results: {
        readingsCount: 5,
        averageTime: 12.38,
        minTime: 12.10,
        maxTime: 12.65,
        stdDeviation: 0.22,
        surfaceVelocity: 0.8078,
        meanVelocity: 0.6866,
        hydraulicArea: 0.605,
        dischargeM3s: 0.4154,
        dischargeLps: 415.4,
        dischargeM3h: 1495.44,
        sideSlopeZ: 0.545,
        wettedPerimeter: 2.052,
        hydraulicRadius: 0.2948,
      },
    };

    await saveAforo(sampleRecord);
  }
}

export type ChannelShape = 'trapezoidal' | 'rectangular' | 'triangular';

export interface TimeReading {
  id: string;
  index: number;
  timeSeconds: number; // en segundos con centésimas
  timestamp: string;
  isExcluded?: boolean; // para descartar lecturas anómalas
}

export interface ChannelGeometry {
  shape: ChannelShape;
  waterSurfaceWidth: number; // Espejo de agua (T) en metros
  waterDepth: number;         // Tirante de agua (y) en metros
  bottomWidth: number;        // Base menor (b) en metros
}

export interface CorrectionFactorPreset {
  name: string;
  description: string;
  factor: number;
}

export interface HydraulicCalculationResults {
  readingsCount: number;
  averageTime: number;          // Tiempo promedio (segundos)
  minTime: number;
  maxTime: number;
  stdDeviation: number;         // Desviación estándar
  surfaceVelocity: number;      // Velocidad superficial (m/s) = L / t_prom
  meanVelocity: number;         // Velocidad media (m/s) = K * V_sup
  hydraulicArea: number;        // Área hidráulica (m2) = (T + b) / 2 * y
  dischargeM3s: number;         // Caudal Q (m3/s) = A * V_med
  dischargeLps: number;         // Caudal Q (L/s) = Q_m3s * 1000
  dischargeM3h: number;         // Caudal Q (m3/h)
  sideSlopeZ: number;           // Talud z = (T - b) / (2 * y)
  wettedPerimeter: number;      // Perímetro mojado P (m)
  hydraulicRadius: number;      // Radio hidráulico Rh (m) = A / P
}

export interface AforoRecord {
  id: string;
  createdAt: string; // ISO string
  code: string;      // ej: AF-2026-001
  channelName: string;
  sectorLocation: string;
  operatorName: string;
  notes?: string;

  // Parámetros de aforo
  distanceMeters: number;      // Distancia del tramo L (m)
  targetReadingsCount: number; // Número de lecturas esperadas
  correctionFactor: number;    // Factor K (0.70 - 0.90)
  correctionFactorDescription?: string;

  // Lecturas
  readings: TimeReading[];

  // Geometría del canal
  geometry: ChannelGeometry;

  // Resultados calculados
  results: HydraulicCalculationResults;
}

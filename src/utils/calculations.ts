import { ChannelGeometry, HydraulicCalculationResults, TimeReading } from '../types';

export function calculateHydraulicResults(
  distanceMeters: number,
  readings: TimeReading[],
  geometry: ChannelGeometry,
  correctionFactor: number
): HydraulicCalculationResults {
  // Filtrar lecturas válidas (no excluidas y mayores a 0)
  const validReadings = readings.filter(r => !r.isExcluded && r.timeSeconds > 0);
  const n = validReadings.length;

  if (n === 0 || distanceMeters <= 0 || geometry.waterDepth <= 0 || geometry.waterSurfaceWidth <= 0) {
    return {
      readingsCount: n,
      averageTime: 0,
      minTime: 0,
      maxTime: 0,
      stdDeviation: 0,
      surfaceVelocity: 0,
      meanVelocity: 0,
      hydraulicArea: 0,
      dischargeM3s: 0,
      dischargeLps: 0,
      dischargeM3h: 0,
      sideSlopeZ: 0,
      wettedPerimeter: 0,
      hydraulicRadius: 0,
    };
  }

  const times = validReadings.map(r => r.timeSeconds);
  const sumTimes = times.reduce((acc, val) => acc + val, 0);
  const averageTime = sumTimes / n;
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);

  // Desviación estándar
  let stdDeviation = 0;
  if (n > 1) {
    const variance = times.reduce((acc, val) => acc + Math.pow(val - averageTime, 2), 0) / (n - 1);
    stdDeviation = Math.sqrt(variance);
  }

  // Velocidades
  const surfaceVelocity = averageTime > 0 ? distanceMeters / averageTime : 0;
  const meanVelocity = surfaceVelocity * correctionFactor;

  // Geometría: T (espejo), b (base menor), y (tirante)
  const T = Math.max(0, geometry.waterSurfaceWidth);
  const b = Math.max(0, geometry.bottomWidth);
  const y = Math.max(0, geometry.waterDepth);

  // Área hidráulica: A = (T + b) / 2 * y
  const hydraulicArea = ((T + b) / 2) * y;

  // Caudales
  const dischargeM3s = hydraulicArea * meanVelocity;
  const dischargeLps = dischargeM3s * 1000;
  const dischargeM3h = dischargeM3s * 3600;

  // Talud z = (T - b) / (2 * y)
  const sideSlopeZ = y > 0 ? Math.max(0, (T - b) / (2 * y)) : 0;

  // Perímetro mojado P = b + 2 * y * sqrt(1 + z^2)
  const wettedPerimeter = b + 2 * y * Math.sqrt(1 + Math.pow(sideSlopeZ, 2));

  // Radio hidráulico Rh = A / P
  const hydraulicRadius = wettedPerimeter > 0 ? hydraulicArea / wettedPerimeter : 0;

  return {
    readingsCount: n,
    averageTime: Number(averageTime.toFixed(3)),
    minTime: Number(minTime.toFixed(3)),
    maxTime: Number(maxTime.toFixed(3)),
    stdDeviation: Number(stdDeviation.toFixed(3)),
    surfaceVelocity: Number(surfaceVelocity.toFixed(4)),
    meanVelocity: Number(meanVelocity.toFixed(4)),
    hydraulicArea: Number(hydraulicArea.toFixed(4)),
    dischargeM3s: Number(dischargeM3s.toFixed(5)),
    dischargeLps: Number(dischargeLps.toFixed(2)),
    dischargeM3h: Number(dischargeM3h.toFixed(2)),
    sideSlopeZ: Number(sideSlopeZ.toFixed(3)),
    wettedPerimeter: Number(wettedPerimeter.toFixed(4)),
    hydraulicRadius: Number(hydraulicRadius.toFixed(4)),
  };
}

export const CORRECTION_FACTOR_PRESETS = [
  {
    name: 'Canal de concreto liso o madera cepillada',
    description: 'Paredes muy lisas, rozamiento mínimo',
    factor: 0.85,
  },
  {
    name: 'Canal de tierra bien conservado o mampostería',
    description: 'Lecho uniforme y limpio (estándar común)',
    factor: 0.85,
  },
  {
    name: 'Canal de tierra con piedras o maleza moderada',
    description: 'Rugosidad moderada en solera y taludes',
    factor: 0.80,
  },
  {
    name: 'Cauce natural, río o canal con alta vegetación',
    description: 'Fuerte rozamiento y turbulencia',
    factor: 0.70,
  },
  {
    name: 'Personalizado',
    description: 'Ingresar valor manual (0.60 - 0.95)',
    factor: 0.85,
  },
];

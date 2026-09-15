import React from 'react';
import { ChannelGeometry } from '../types';

interface Props {
  geometry: ChannelGeometry;
  sideSlopeZ: number;
}

export const CrossSectionViewer: React.FC<Props> = ({ geometry, sideSlopeZ }) => {
  const { shape, waterSurfaceWidth: T, waterDepth: y, bottomWidth: b } = geometry;

  // Si los datos son cero o negativos, mostrar placeholder informativo
  if (T <= 0 || y <= 0) {
    return (
      <div id="cross-section-placeholder" className="h-44 w-full bg-slate-900/60 border border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-400 p-4 text-center">
        <svg className="w-10 h-10 mb-2 text-slate-500 stroke-current" viewBox="0 0 24 24" fill="none" strokeWidth="1.5">
          <path d="M4 8l4 8h8l4-8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 12h16" strokeDasharray="2 2" strokeLinecap="round" />
        </svg>
        <p className="text-xs font-medium">Ingresa el Espejo de Agua (T) y el Tirante (y) para visualizar la sección transversal</p>
      </div>
    );
  }

  // Dimensiones del viewBox SVG
  const svgWidth = 320;
  const svgHeight = 160;
  const paddingX = 45;
  const paddingY = 28;

  const maxWidth = Math.max(T, b, 0.1);
  const scaleX = (svgWidth - paddingX * 2) / maxWidth;
  const scaleY = (svgHeight - paddingY * 2) / Math.max(y, 0.1);
  const scale = Math.min(scaleX, scaleY);

  const centerX = svgWidth / 2;
  const waterSurfaceY = paddingY + 6;
  const bottomY = waterSurfaceY + y * scale;

  // Coordenadas
  const halfT = (T * scale) / 2;
  const halfB = (b * scale) / 2;

  const topLeftX = centerX - halfT;
  const topRightX = centerX + halfT;
  const bottomLeftX = centerX - halfB;
  const bottomRightX = centerX + halfB;

  // Extensión de bordes libres del canal (más allá del agua)
  const freeboard = 12;
  const wallTopLeftX = topLeftX - (halfT - halfB) * 0.2 - freeboard * 0.5;
  const wallTopRightX = topRightX + (halfT - halfB) * 0.2 + freeboard * 0.5;
  const wallTopY = waterSurfaceY - freeboard;

  // Polígono del agua
  const waterPoints = `${topLeftX},${waterSurfaceY} ${topRightX},${waterSurfaceY} ${bottomRightX},${bottomY} ${bottomLeftX},${bottomY}`;

  return (
    <div id="cross-section-viewer" className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 relative overflow-hidden">
      <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
        <span className="font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          Sección Transversal ({shape === 'trapezoidal' ? 'Trapecial' : shape === 'rectangular' ? 'Rectangular' : 'Triangular'})
        </span>
        <span className="font-mono text-[11px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">
          Z = {sideSlopeZ.toFixed(2)}:1
        </span>
      </div>

      <div className="w-full flex justify-center items-center">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto max-h-48 drop-shadow-md select-none"
        >
          <defs>
            {/* Gradiente de agua hidráulica */}
            <linearGradient id="waterFlowGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#0369a1" stopOpacity="0.9" />
            </linearGradient>

            {/* Marcadores de flechas */}
            <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#38bdf8" />
            </marker>
          </defs>

          {/* Paredes exteriores del canal (tierra / concreto) */}
          <path
            d={`M ${wallTopLeftX} ${wallTopY} L ${topLeftX} ${waterSurfaceY} L ${bottomLeftX} ${bottomY} L ${bottomRightX} ${bottomY} L ${topRightX} ${waterSurfaceY} L ${wallTopRightX} ${wallTopY}`}
            fill="none"
            stroke="#475569"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Sombreado del suelo circundante */}
          <path
            d={`M ${wallTopLeftX - 10} ${wallTopY} L ${wallTopLeftX} ${wallTopY} L ${topLeftX} ${waterSurfaceY} L ${bottomLeftX} ${bottomY} L ${bottomRightX} ${bottomY} L ${topRightX} ${waterSurfaceY} L ${wallTopRightX} ${wallTopY} L ${wallTopRightX + 10} ${wallTopY}`}
            fill="none"
            stroke="#334155"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />

          {/* Cuerpo de agua hidráulica */}
          <polygon points={waterPoints} fill="url(#waterFlowGradient)" />

          {/* Línea de superficie del espejo de agua con ondas estilizadas */}
          <line
            x1={topLeftX}
            y1={waterSurfaceY}
            x2={topRightX}
            y2={waterSurfaceY}
            stroke="#67e8f9"
            strokeWidth="2.5"
          />

          {/* Símbolo de superficie libre (triangulito invertido de nivel de agua) */}
          <polygon
            points={`${centerX},${waterSurfaceY} ${centerX - 4},${waterSurfaceY - 7} ${centerX + 4},${waterSurfaceY - 7}`}
            fill="#38bdf8"
          />
          <line
            x1={centerX - 6}
            y1={waterSurfaceY - 8}
            x2={centerX + 6}
            y2={waterSurfaceY - 8}
            stroke="#38bdf8"
            strokeWidth="1"
          />

          {/* COTA SUPERIOR: Espejo de agua (T) */}
          <g className="text-cyan-300">
            <line
              x1={topLeftX}
              y1={waterSurfaceY - 14}
              x2={topRightX}
              y2={waterSurfaceY - 14}
              stroke="#38bdf8"
              strokeWidth="1.2"
              markerStart="url(#arrow)"
              markerEnd="url(#arrow)"
            />
            {/* Líneas auxiliares verticales */}
            <line x1={topLeftX} y1={waterSurfaceY - 18} x2={topLeftX} y2={waterSurfaceY} stroke="#38bdf8" strokeWidth="0.75" strokeDasharray="2 2" />
            <line x1={topRightX} y1={waterSurfaceY - 18} x2={topRightX} y2={waterSurfaceY} stroke="#38bdf8" strokeWidth="0.75" strokeDasharray="2 2" />
            <rect x={centerX - 24} y={waterSurfaceY - 21} width="48" height="12" rx="3" fill="#0f172a" />
            <text x={centerX} y={waterSurfaceY - 12.5} textAnchor="middle" fill="#7dd3fc" fontSize="9" fontWeight="bold" fontFamily="monospace">
              T={T.toFixed(2)}m
            </text>
          </g>

          {/* COTA VERTICAL: Tirante (y) */}
          <g className="text-amber-300">
            <line
              x1={centerX}
              y1={waterSurfaceY}
              x2={centerX}
              y2={bottomY}
              stroke="#f59e0b"
              strokeWidth="1.2"
              strokeDasharray="3 2"
            />
            <rect x={centerX + 4} y={(waterSurfaceY + bottomY) / 2 - 6} width="44" height="12" rx="3" fill="#0f172a" />
            <text x={centerX + 26} y={(waterSurfaceY + bottomY) / 2 + 3} textAnchor="middle" fill="#fbbf24" fontSize="9" fontWeight="bold" fontFamily="monospace">
              y={y.toFixed(2)}m
            </text>
          </g>

          {/* COTA INFERIOR: Base menor (b) si b > 0 */}
          {b > 0 && (
            <g className="text-emerald-300">
              <line
                x1={bottomLeftX}
                y1={bottomY + 12}
                x2={bottomRightX}
                y2={bottomY + 12}
                stroke="#34d399"
                strokeWidth="1.2"
                markerStart="url(#arrow)"
                markerEnd="url(#arrow)"
              />
              <line x1={bottomLeftX} y1={bottomY} x2={bottomLeftX} y2={bottomY + 15} stroke="#34d399" strokeWidth="0.75" strokeDasharray="2 2" />
              <line x1={bottomRightX} y1={bottomY} x2={bottomRightX} y2={bottomY + 15} stroke="#34d399" strokeWidth="0.75" strokeDasharray="2 2" />
              <rect x={centerX - 24} y={bottomY + 5} width="48" height="12" rx="3" fill="#0f172a" />
              <text x={centerX} y={bottomY + 14} textAnchor="middle" fill="#6ee7b7" fontSize="9" fontWeight="bold" fontFamily="monospace">
                b={b.toFixed(2)}m
              </text>
            </g>
          )}
        </svg>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-800/80 text-center">
        <div className="bg-slate-900/90 rounded p-1.5 border border-slate-800">
          <p className="text-[10px] text-slate-400 font-medium">Espejo (T)</p>
          <p className="text-xs font-mono font-bold text-cyan-300">{T.toFixed(2)} m</p>
        </div>
        <div className="bg-slate-900/90 rounded p-1.5 border border-slate-800">
          <p className="text-[10px] text-slate-400 font-medium">Tirante (y)</p>
          <p className="text-xs font-mono font-bold text-amber-300">{y.toFixed(2)} m</p>
        </div>
        <div className="bg-slate-900/90 rounded p-1.5 border border-slate-800">
          <p className="text-[10px] text-slate-400 font-medium">Base (b)</p>
          <p className="text-xs font-mono font-bold text-emerald-300">{b.toFixed(2)} m</p>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { BookOpen, Info, CheckCircle, ShieldAlert, Award } from 'lucide-react';

export const HydraulicGuide: React.FC = () => {
  return (
    <div id="hydraulic-guide" className="space-y-4 text-xs text-slate-300 pb-12">
      {/* Resumen General */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2 text-cyan-400">
          <BookOpen className="w-5 h-5" />
          <h2 className="font-bold text-base text-white">Manual del Método del Flotador</h2>
        </div>
        <p className="leading-relaxed text-slate-300">
          El <strong>método del flotador</strong> es un procedimiento hidrográfico expedito y ampliamente utilizado en campo para determinar el caudal (<em className="font-mono">Q</em>) que transporta un canal abierto o curso de agua natural.
        </p>
      </div>

      {/* Fórmulas Hidráulicas Utilizadas */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <h3 className="font-bold text-sm text-cyan-300 flex items-center gap-1.5">
          <Info className="w-4 h-4" />
          <span>Fórmulas de Cálculo Aplicadas</span>
        </h3>

        <div className="space-y-2 font-mono">
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-cyan-400 block font-sans">1. Velocidad Superficial</span>
            <div className="text-sm font-bold text-white mt-0.5">V_sup = L / t_prom</div>
            <span className="text-[10px] text-slate-500 font-sans">L = Distancia del tramo (m), t_prom = Tiempo promedio (s)</span>
          </div>

          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-cyan-400 block font-sans">2. Velocidad Media Corregida</span>
            <div className="text-sm font-bold text-white mt-0.5">V_med = K × V_sup</div>
            <span className="text-[10px] text-slate-500 font-sans">K = Factor de corrección (0.70 a 0.90) debido a la fricción de fondo</span>
          </div>

          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-cyan-400 block font-sans">3. Área Hidráulica de la Sección</span>
            <div className="text-sm font-bold text-white mt-0.5">A = [(T + b) / 2] × y</div>
            <span className="text-[10px] text-slate-500 font-sans">T = Espejo de agua (m), b = Base menor (m), y = Tirante (m)</span>
          </div>

          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-cyan-400 block font-sans">4. Caudal o Gasto Total</span>
            <div className="text-sm font-bold text-white mt-0.5">Q = A × V_med  (m³/s)</div>
            <div className="text-sm font-bold text-cyan-400">Q (L/s) = Q × 1,000</div>
          </div>
        </div>
      </div>

      {/* Tabla de Factores de Corrección (K) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <h3 className="font-bold text-sm text-amber-400 flex items-center gap-1.5">
          <Award className="w-4 h-4" />
          <span>Factores de Corrección (K) Recomendados</span>
        </h3>
        <p className="text-[11px] text-slate-400">
          La velocidad del flotador en la superficie es superior a la velocidad promedio de la masa de agua. Se aplican los siguientes coeficientes (Ven Te Chow / USBR):
        </p>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between items-center p-2 rounded-lg bg-slate-950 border border-slate-800">
            <span>Canal de concreto liso o madera cepillada</span>
            <span className="font-mono font-bold text-cyan-300">0.85 – 0.90</span>
          </div>
          <div className="flex justify-between items-center p-2 rounded-lg bg-slate-950 border border-slate-800">
            <span>Canal en tierra uniforme y limpio</span>
            <span className="font-mono font-bold text-cyan-300">0.80 – 0.85</span>
          </div>
          <div className="flex justify-between items-center p-2 rounded-lg bg-slate-950 border border-slate-800">
            <span>Canal de tierra con piedras o vegetación</span>
            <span className="font-mono font-bold text-cyan-300">0.75 – 0.80</span>
          </div>
          <div className="flex justify-between items-center p-2 rounded-lg bg-slate-950 border border-slate-800">
            <span>Cauces naturales irregulares o ríos con maleza</span>
            <span className="font-mono font-bold text-cyan-300">0.65 – 0.70</span>
          </div>
        </div>
      </div>

      {/* Criterios de Campo */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2.5">
        <h3 className="font-bold text-sm text-emerald-400 flex items-center gap-1.5">
          <CheckCircle className="w-4 h-4" />
          <span>Recomendaciones Técnicas de Campo</span>
        </h3>
        <ul className="space-y-2 text-slate-300 text-xs pl-1">
          <li className="flex items-start gap-2">
            <span className="text-cyan-400 font-bold">•</span>
            <span><strong>Longitud del tramo:</strong> Seleccionar un tramo recto de al menos 10 a 20 metros con sección transversal y pendiente uniformes.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-cyan-400 font-bold">•</span>
            <span><strong>Tipo de flotador:</strong> Utilizar una botella parcialmente lastrada con agua/arena para que quede sumergida al menos 2/3 de su altura y reducir el efecto del viento.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-cyan-400 font-bold">•</span>
            <span><strong>Lanzamiento previo:</strong> Soltar el flotador unos 2 a 3 metros antes de la sección inicial para que adquiera la velocidad del flujo.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-cyan-400 font-bold">•</span>
            <span><strong>Número de lecturas:</strong> Tomar un mínimo de 3 a 5 lecturas para calcular un promedio representativo y descartar valores erráticos.</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

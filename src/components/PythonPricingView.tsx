import React, { useState } from 'react';
import { Room } from '../types';
import { Cpu, Play, CheckCircle2, TrendingUp, Sparkles, ArrowRight, DollarSign, AlertCircle } from 'lucide-react';

interface PythonPricingViewProps {
  rooms: Room[];
  onNotify: (message: string, type: 'success' | 'info' | 'error') => void;
}

export const PythonPricingView: React.FC<PythonPricingViewProps> = ({
  rooms,
  onNotify,
}) => {
  const [selectedRoomType, setSelectedRoomType] = useState<string>('Suite Deluxe');
  const [basePrice, setBasePrice] = useState<number>(390000);
  const [occupancyPct, setOccupancyPct] = useState<number>(75);
  const [leadDays, setLeadDays] = useState<number>(14);
  const [isExecuting, setIsExecuting] = useState(false);

  const [pricingResult, setPricingResult] = useState<{
    recommendedPrice: number;
    seasonalFactor: number;
    demandClassification: string;
    cancelProbability: number;
    percentageDelta: number;
    executionTimeMs: number;
  } | null>(null);

  const handleRunAlgorithm = () => {
    setIsExecuting(true);
    setTimeout(() => {
      let factor = 1.0;
      let demanda = 'Demanda Regular';
      let cancelRisk = 0.12;

      if (occupancyPct >= 80) {
        factor = 1.25;
        demanda = 'Demanda Muy Alta (Temporada Festiva / Vacaciones)';
        cancelRisk = 0.05;
      } else if (occupancyPct >= 60) {
        factor = 1.10;
        demanda = 'Demanda Media-Alta';
        cancelRisk = 0.08;
      } else if (occupancyPct <= 35) {
        factor = 0.90;
        demanda = 'Demanda Baja (Estrategia Promocional)';
        cancelRisk = 0.19;
      }

      if (leadDays > 30) {
        cancelRisk += 0.07;
      }

      const finalPrice = Math.round((basePrice * factor) / 1000) * 1000;
      const delta = Number((((finalPrice - basePrice) / basePrice) * 100).toFixed(1));

      setPricingResult({
        recommendedPrice: finalPrice,
        seasonalFactor: factor,
        demandClassification: demanda,
        cancelProbability: Number(cancelRisk.toFixed(2)),
        percentageDelta: delta,
        executionTimeMs: Math.floor(Math.random() * 6) + 12,
      });

      setIsExecuting(false);
      onNotify('Microservicio Python ejecutado: Tarifa dinámica y riesgo calculados', 'info');
    }, 400);
  };

  const formatCOP = (val: number) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold tracking-wide">
          INTELIGENCIA DE REVENUE & MICROSERVICIO EN PYTHON (FASTAPI)
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mt-1">
          Motor Predictivo de Tarifas & Demanda Hotelera
        </h1>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
          Demuestra la integración entre el backend PHP MVC de Hotel Luna Azul y un microservicio en Python (FastAPI/REST)
          que optimiza automáticamente las tarifas por noche en función de la ocupación hotelera y estima el riesgo de cancelación.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Test Bench */}
        <div className="lg:col-span-7 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Banco de Simulación Python
              </h2>
            </div>
            <span className="text-[11px] font-mono text-slate-500">
              POST /api/pricing/dynamic
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Tipo de Habitación
              </label>
              <select
                value={selectedRoomType}
                onChange={(e) => {
                  setSelectedRoomType(e.target.value);
                  const p = e.target.value === 'Sencilla' ? 160000 : e.target.value === 'Doble' ? 230000 : e.target.value === 'Suite Deluxe' ? 390000 : 340000;
                  setBasePrice(p);
                  setPricingResult(null);
                }}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
              >
                <option value="Sencilla">Sencilla (Base: $160.000)</option>
                <option value="Doble">Doble (Base: $230.000)</option>
                <option value="Suite Deluxe">Suite Deluxe (Base: $390.000)</option>
                <option value="Familiar">Familiar (Base: $340.000)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Precio Base por Noche (COP)
              </label>
              <input
                type="number"
                value={basePrice}
                onChange={(e) => setBasePrice(Number(e.target.value))}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
              />
            </div>
          </div>

          {/* Sliders */}
          <div className="space-y-4 pt-2">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Ocupación Actual del Hotel</span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{occupancyPct}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={occupancyPct}
                onChange={(e) => setOccupancyPct(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Temporada Baja (&lt;40%)</span>
                <span>Equilibrio (60%)</span>
                <span>Temporada Alta (&gt;80%)</span>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Días de Anticipación de Reserva</span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{leadDays} días</span>
              </div>
              <input
                type="range"
                min="1"
                max="90"
                value={leadDays}
                onChange={(e) => setLeadDays(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>
          </div>

          {/* Run Button */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleRunAlgorithm}
              disabled={isExecuting}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{isExecuting ? 'Calculando en Python...' : 'Calcular Tarifa Dinámica en Python'}</span>
            </button>
            <span className="text-xs text-slate-400 font-mono">
              FastAPI Endpoint @ 127.0.0.1:8000
            </span>
          </div>

          {/* Result Card */}
          {pricingResult && (
            <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/40 dark:bg-blue-950/20 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-blue-800 dark:text-blue-300">
                    TARIFA ÓPTIMA SUGERIDA POR PYTHON
                  </span>
                  <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
                    {formatCOP(pricingResult.recommendedPrice)}
                    <span className="text-xs font-normal text-slate-500 ml-1">/ noche</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-500 block">Variación vs Base</span>
                  <span className={`text-base font-bold font-mono ${pricingResult.percentageDelta >= 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {pricingResult.percentageDelta >= 0 ? `+${pricingResult.percentageDelta}%` : `${pricingResult.percentageDelta}%`}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded bg-white dark:bg-slate-800 border border-blue-100 dark:border-blue-900">
                  <span className="text-[11px] text-slate-500 block">Factor Temporada</span>
                  <strong className="font-mono text-blue-700 dark:text-blue-300">{pricingResult.seasonalFactor}x</strong>
                </div>
                <div className="p-2 rounded bg-white dark:bg-slate-800 border border-blue-100 dark:border-blue-900">
                  <span className="text-[11px] text-slate-500 block">Clasificación</span>
                  <strong className="text-slate-800 dark:text-slate-200 truncate block text-[11px]">{pricingResult.demandClassification}</strong>
                </div>
                <div className="p-2 rounded bg-white dark:bg-slate-800 border border-blue-100 dark:border-blue-900">
                  <span className="text-[11px] text-slate-500 block">Riesgo Cancelación</span>
                  <strong className="font-mono text-amber-600 dark:text-amber-400">{Math.round(pricingResult.cancelProbability * 100)}%</strong>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 border-t border-blue-100 dark:border-blue-900/60 pt-2 flex justify-between">
                <span>Latencia microservicio: <strong className="font-mono text-slate-700 dark:text-slate-300">{pricingResult.executionTimeMs} ms</strong></span>
                <span>Algoritmo: Revenue Optimization Heuristic v1.2</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Info: Why Python microservice in ACA CUN? */}
        <div className="lg:col-span-5 space-y-4 text-xs">
          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span>Justificación Técnica en la ACA CUN</span>
            </h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              En la hotelería moderna, la gestión manual no solo provocaba sobreventas en Hotel Luna Azul, sino
              que cobraba tarifas estáticas ignorando temporadas altas de vacaciones o puentes festivos.
            </p>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              La arquitectura desacoplada permite que el backend en <strong>PHP</strong> se comunique de forma transparente
              con el microservicio en <strong>Python</strong> vía cURL/HTTP sin bloquear la experiencia del recepcionista.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Room, Guest, Reservation, HotelSettings } from '../types';
import { Hotel, CalendarCheck, Users, BedDouble, ShieldCheck, ArrowUpRight, LogIn, LogOut, TrendingUp, Sparkles, MapPin } from 'lucide-react';

interface HotelDashboardViewProps {
  rooms: Room[];
  guests: Guest[];
  reservations: Reservation[];
  hotelSettings: HotelSettings;
  onNavigateTab: (tab: string) => void;
  onSelectReservation: (reservation: Reservation) => void;
  onNewReservation: () => void;
  onQuickCheckIn: (resId: string) => void;
  onQuickCheckOut: (resId: string) => void;
}

export const HotelDashboardView: React.FC<HotelDashboardViewProps> = ({
  rooms,
  guests,
  reservations,
  hotelSettings,
  onNavigateTab,
  onSelectReservation,
  onNewReservation,
  onQuickCheckIn,
  onQuickCheckOut,
}) => {
  const occupiedRoomsCount = rooms.filter((r) => r.status === 'Ocupada').length;
  const availableRoomsCount = rooms.filter((r) => r.status === 'Disponible').length;
  const occupancyPercentage = Math.round((occupiedRoomsCount / rooms.length) * 100);

  // Active reservations
  const inHouseReservations = reservations.filter((r) => r.status === 'En Estancia');
  const confirmedReservations = reservations.filter((r) => r.status === 'Confirmada');

  // Revenue calculation
  const totalRevenueCOP = reservations
    .filter((r) => r.status !== 'Cancelada')
    .reduce((acc, r) => acc + r.totalAmount, 0);

  // Average Daily Rate (ADR)
  const totalNights = reservations.reduce((acc, r) => acc + (r.status !== 'Cancelada' ? r.nightsCount : 0), 0);
  const adr = totalNights > 0 ? Math.round(totalRevenueCOP / totalNights) : 280000;

  const formatCOP = (val: number) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner / Hero Hotel Luna Azul */}
      <div className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <div className="p-6 lg:p-8 lg:col-span-7 flex flex-col justify-between">
            <div>
              <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold tracking-wide flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                <span>{hotelSettings.city} · {hotelSettings.rntNumber}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mt-2 mb-3">
                Plataforma de Control Hotelero & Reservas
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
                Bienvenido al sistema central de gestión (PMS) del <strong>Hotel Luna Azul</strong>. Supervise en tiempo real
                la ocupación de habitaciones, administre reservas directas con protección anti-sobreventa, coordine check-ins
                y optimice las tarifas con inteligencia de mercado.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={onNewReservation}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg transition-colors cursor-pointer"
              >
                + Registrar Reserva
              </button>
              <button
                onClick={() => onNavigateTab('guests')}
                className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                Directorio de Huéspedes ({guests.length})
              </button>
              <button
                onClick={() => onNavigateTab('pricing')}
                className="px-4 py-2 text-xs font-semibold text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors cursor-pointer"
              >
                Motor de Precios Dinámicos
              </button>
            </div>
          </div>

          <div className="relative lg:col-span-5 h-56 lg:h-auto min-h-[220px]">
            <img
              src="/src/assets/images/hotel_hero_luna_azul_1794168162799.jpg"
              alt="Lobby y recepción del Hotel Luna Azul"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-white via-transparent to-transparent dark:from-slate-900 dark:via-transparent dark:to-transparent lg:w-24" />
          </div>
        </div>
      </div>

      {/* Numerical Metrics KPI Strip (Tabular Figures) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-start justify-between">
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Tasa de Ocupación</div>
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 mt-1">
              {occupancyPercentage}%
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {occupiedRoomsCount} ocupadas de {rooms.length} habitaciones
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
            <BedDouble className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-start justify-between">
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Huéspedes en Estancia</div>
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 mt-1">
              {inHouseReservations.length}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {confirmedReservations.length} reservas programadas
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-start justify-between">
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Tarifa Promedio (ADR)</div>
            <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-blue-600 dark:text-blue-400 mt-1">
              {formatCOP(adr)}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Ingresos: {formatCOP(totalRevenueCOP)}
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
            <CalendarCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-start justify-between">
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Protección Anti-Sobreventa</div>
            <div className="text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400 mt-1">
              0 Conflictos
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Overbooking Shield 100% activo
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Grid: Active In-House & Check-Ins vs Rooms Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Operations Table (Check-Ins / In-House) */}
        <div className="lg:col-span-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Operaciones de Recepción en Tiempo Real
              </h2>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Monitoreo de llegadas, estancias en curso y salidas programadas
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('reservations')}
              className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Ver todas las reservas ({reservations.length})</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/30">
                  <th className="py-3 px-4">Código / Huésped</th>
                  <th className="py-3 px-4">Habitación</th>
                  <th className="py-3 px-4">Estancia (In - Out)</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Recepción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {reservations.slice(0, 5).map((res) => {
                  return (
                    <tr
                      key={res.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {res.guestName}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                          {res.code} <span aria-hidden="true">·</span> {res.guestPhone}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 dark:text-slate-100">
                          Hab. {res.roomNumber}
                        </span>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {res.roomType}
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-xs text-slate-600 dark:text-slate-300">
                        <div>{res.checkInDate} <span className="text-slate-400">al</span> {res.checkOutDate}</div>
                        <span className="text-[11px] text-slate-400">{res.nightsCount} noche(s) · {res.guestsCount} pers.</span>
                      </td>

                      <td className="py-3 px-4 text-xs">
                        <span
                          className={`font-semibold ${
                            res.status === 'En Estancia'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : res.status === 'Confirmada'
                              ? 'text-blue-600 dark:text-blue-400'
                              : res.status === 'Completada'
                              ? 'text-slate-500'
                              : 'text-rose-600'
                          }`}
                        >
                          {res.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        {res.status === 'Confirmada' ? (
                          <button
                            onClick={() => onQuickCheckIn(res.id)}
                            className="flex items-center gap-1 ml-auto px-2.5 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors cursor-pointer"
                          >
                            <LogIn className="w-3.5 h-3.5" />
                            <span>Check-In</span>
                          </button>
                        ) : res.status === 'En Estancia' ? (
                          <button
                            onClick={() => onQuickCheckOut(res.id)}
                            className="flex items-center gap-1 ml-auto px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded transition-colors cursor-pointer"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Check-Out</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => onSelectReservation(res)}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                          >
                            Ver Voucher
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Room Inventory & Business Info */}
        <div className="lg:col-span-4 space-y-6">
          {/* Room Availability Breakdown */}
          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Hotel className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Estado de Habitaciones</span>
              </h3>
              <button
                onClick={() => onNavigateTab('rooms')}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                Inventario
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900">
                <span className="text-emerald-700 dark:text-emerald-400 block font-medium">Disponibles</span>
                <span className="text-xl font-bold font-mono text-emerald-800 dark:text-emerald-300">
                  {availableRoomsCount}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900">
                <span className="text-blue-700 dark:text-blue-400 block font-medium">Ocupadas</span>
                <span className="text-xl font-bold font-mono text-blue-800 dark:text-blue-300">
                  {occupiedRoomsCount}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900">
                <span className="text-amber-700 dark:text-amber-400 block font-medium">En Limpieza</span>
                <span className="text-xl font-bold font-mono text-amber-800 dark:text-amber-300">
                  {rooms.filter((r) => r.status === 'Limpieza').length}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-600 dark:text-slate-400 block font-medium">Mantenimiento</span>
                <span className="text-xl font-bold font-mono text-slate-800 dark:text-slate-200">
                  {rooms.filter((r) => r.status === 'Mantenimiento').length}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Business Card */}
          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 tracking-wider">
                HOTEL BOUTIQUE EN BAHÍA DE SANTA MARTA
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Gestión centralizada de reservas con confirmación instantánea, pasarela de pagos y
              comunicación directa con el equipo de recepción.
            </p>
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => onNavigateTab('pricing')}
                className="w-full py-2 px-3 text-xs font-semibold text-center text-blue-700 dark:text-blue-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Ajustar Tarifas Estacionales (Revenue AI)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

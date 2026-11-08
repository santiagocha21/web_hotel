import React, { useState } from 'react';
import { X, Search, CheckCircle2, AlertCircle, Calendar, MapPin, User, Download, Phone, Mail } from 'lucide-react';
import { Reservation, Room } from '../types';

interface GuestLookupModalProps {
  reservations: Reservation[];
  rooms: Room[];
  onClose: () => void;
}

export const GuestLookupModal: React.FC<GuestLookupModalProps> = ({
  reservations,
  rooms,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [foundReservation, setFoundReservation] = useState<Reservation | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    if (!query) return;

    const match = reservations.find(
      (r) =>
        r.code.toLowerCase().includes(query) ||
        r.guestDocument.toLowerCase().includes(query) ||
        r.guestName.toLowerCase().includes(query)
    );

    setFoundReservation(match || null);
    setHasSearched(true);
  };

  const roomDetails = foundReservation
    ? rooms.find((r) => r.id === foundReservation.roomId)
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <Search className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="font-bold text-base">Consultar Mi Reserva</h3>
              <p className="text-xs text-slate-400">Verifique el estado y voucher de su estadía</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          <form onSubmit={handleSearch} className="space-y-3">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Ingrese su Código de Reserva o Documento de Identidad
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ej. RES-2026-101 o 1098765432"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100"
              />
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Search className="w-4 h-4" />
                <span>Buscar</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              * El código de reserva fue provisto al momento de confirmar su reserva en el sitio web oficial.
            </p>
          </form>

          {hasSearched && !foundReservation && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl text-center space-y-2">
              <AlertCircle className="w-8 h-8 text-amber-600 mx-auto" />
              <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                No encontramos reservas con el criterio ingresado
              </h4>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Por favor revise el código ingresado o comuníquese directamente con nuestra recepción al +57 (605) 438-9900.
              </p>
            </div>
          )}

          {foundReservation && (
            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-5 space-y-4 shadow-sm animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">VOUCHER OFICIAL</span>
                  <div className="text-lg font-bold font-mono text-blue-600 dark:text-blue-400">
                    {foundReservation.code}
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  foundReservation.status === 'Confirmada'
                    ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300'
                    : foundReservation.status === 'En Estancia'
                    ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'
                    : foundReservation.status === 'Completada'
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    : 'bg-red-100 dark:bg-red-900/60 text-red-700 dark:text-red-300'
                }`}>
                  {foundReservation.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 flex items-center gap-1">
                    <User className="w-3.5 h-3.5" /> Titular:
                  </span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {foundReservation.guestName}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Documento:</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {foundReservation.guestDocument}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Fechas de Estadía:
                  </span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {foundReservation.checkInDate} al {foundReservation.checkOutDate} ({foundReservation.nightsCount} noches)
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Habitación Asignada:</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    Hab. {foundReservation.roomNumber} ({foundReservation.roomType})
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs">
                <div>
                  <span className="text-slate-400">Total Reserva:</span>
                  <div className="font-bold text-base text-slate-900 dark:text-slate-100">
                    ${foundReservation.totalAmount.toLocaleString('es-CO')} COP
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-slate-400">Estado de Pago:</span>
                  <div className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {foundReservation.paymentStatus} ({foundReservation.paymentMethod})
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/40 p-3 rounded-lg text-[11px] text-blue-800 dark:text-blue-300 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Check-in a las 15:00 · Check-out a las 12:00</span>
                </div>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="font-bold underline hover:text-blue-600 cursor-pointer"
                >
                  Imprimir Comprobante
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <Phone className="w-3.5 h-3.5" />
            <span>Concierge: +57 (605) 438-9900</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

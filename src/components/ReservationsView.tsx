import React, { useState, useMemo } from 'react';
import { Reservation, Room, Guest } from '../types';
import { Search, Filter, Plus, Download, LogIn, LogOut, Printer, AlertTriangle, ShieldCheck, X } from 'lucide-react';

interface ReservationsViewProps {
  reservations: Reservation[];
  rooms: Room[];
  guests: Guest[];
  onAddReservation: (resData: Omit<Reservation, 'id' | 'code' | 'createdAt' | 'updatedAt'>) => boolean;
  onUpdateReservationStatus: (resId: string, status: Reservation['status']) => void;
  onNotify: (message: string, type: 'success' | 'info' | 'error') => void;
}

export const ReservationsView: React.FC<ReservationsViewProps> = ({
  reservations,
  rooms,
  guests,
  onAddReservation,
  onUpdateReservationStatus,
  onNotify,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roomTypeFilter, setRoomTypeFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [voucherModalRes, setVoucherModalRes] = useState<Reservation | null>(null);

  // Form State for new reservation
  const [formGuestId, setFormGuestId] = useState<string>(guests[0]?.id || '');
  const [formRoomId, setFormRoomId] = useState<string>(rooms[0]?.id || '');
  const [formCheckIn, setFormCheckIn] = useState<string>(new Date().toISOString().slice(0, 10));
  const [formCheckOut, setFormCheckOut] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().slice(0, 10);
  });
  const [formGuestsCount, setFormGuestsCount] = useState<number>(2);
  const [formSpecialRequests, setFormSpecialRequests] = useState<string>('');
  const [formSource, setFormSource] = useState<Reservation['source']>('Web Directa');

  // Calculate nights and prices dynamically
  const selectedRoom = rooms.find((r) => r.id === formRoomId) || rooms[0];
  const nights = useMemo(() => {
    if (!formCheckIn || !formCheckOut) return 1;
    const diff = (new Date(formCheckOut).getTime() - new Date(formCheckIn).getTime()) / (1000 * 60 * 60 * 24);
    return diff > 0 ? diff : 1;
  }, [formCheckIn, formCheckOut]);

  const estimatedTotal = (selectedRoom?.pricePerNight || 0) * nights;
  const estimatedDeposit = Math.round(estimatedTotal * 0.5);

  // Overbooking check in UI preview
  const isConflictDetected = useMemo(() => {
    return reservations.some((r) => {
      if (r.roomId !== formRoomId) return false;
      if (r.status === 'Cancelada' || r.status === 'Completada') return false;
      // Overlap condition
      return !(formCheckOut <= r.checkInDate || formCheckIn >= r.checkOutDate);
    });
  }, [reservations, formRoomId, formCheckIn, formCheckOut]);

  // Filtered reservations
  const filteredReservations = useMemo(() => {
    return reservations.filter((r) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        r.guestName.toLowerCase().includes(q) ||
        r.code.toLowerCase().includes(q) ||
        r.guestPhone.includes(q) ||
        r.roomNumber.includes(q);

      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
      const matchesType = roomTypeFilter === 'all' || r.roomType === roomTypeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [reservations, searchQuery, statusFilter, roomTypeFilter]);

  const formatCOP = (val: number) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formCheckIn >= formCheckOut) {
      onNotify('La fecha de Check-In debe ser anterior al Check-Out.', 'error');
      return;
    }

    const guest = guests.find((g) => g.id === formGuestId);
    if (!guest || !selectedRoom) {
      onNotify('Seleccione un huésped y habitación válidos.', 'error');
      return;
    }

    const success = onAddReservation({
      guestId: guest.id,
      guestName: `${guest.firstName} ${guest.lastName}`,
      guestDocument: `${guest.documentType} ${guest.documentNumber}`,
      guestPhone: guest.phone,
      roomId: selectedRoom.id,
      roomNumber: selectedRoom.number,
      roomType: selectedRoom.type,
      checkInDate: formCheckIn,
      checkOutDate: formCheckOut,
      nightsCount: nights,
      guestsCount: formGuestsCount,
      pricePerNight: selectedRoom.pricePerNight,
      totalAmount: estimatedTotal,
      depositAmount: estimatedDeposit,
      pendingAmount: estimatedTotal - estimatedDeposit,
      status: 'Confirmada',
      specialRequests: formSpecialRequests,
      source: formSource,
    });

    if (success) {
      setShowCreateModal(false);
      setFormSpecialRequests('');
    }
  };

  const handleExportCSV = () => {
    const headers = ['Codigo', 'Huesped', 'Documento', 'Telefono', 'Habitacion', 'Tipo', 'CheckIn', 'CheckOut', 'Noches', 'Total_COP', 'Estado', 'Origen'];
    const rows = filteredReservations.map((r) => [
      r.code,
      `"${r.guestName}"`,
      r.guestDocument,
      r.guestPhone,
      r.roomNumber,
      r.roomType,
      r.checkInDate,
      r.checkOutDate,
      r.nightsCount,
      r.totalAmount,
      r.status,
      r.source,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.href = encoded;
    link.download = `reservas_hotel_luna_azul_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onNotify('Reporte CSV de reservas exportado correctamente', 'success');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Módulo de Reservas & Prevención de Sobreventa
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Motor de asignación de habitaciones con validación estricta de fechas para Hotel Luna Azul
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Reserva</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por huésped, código RES, teléfono o habitación..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="sm:col-span-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="all">Todos los Estados</option>
              <option value="Confirmada">Confirmada (Por Ingresar)</option>
              <option value="En Estancia">En Estancia (Checked-In)</option>
              <option value="Completada">Completada (Checked-Out)</option>
              <option value="Cancelada">Cancelada</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={roomTypeFilter}
              onChange={(e) => setRoomTypeFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="all">Todas las Categorías</option>
              <option value="Sencilla">Sencilla</option>
              <option value="Doble">Doble</option>
              <option value="Suite Deluxe">Suite Deluxe</option>
              <option value="Familiar">Familiar</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <div>
            Mostrando <strong className="font-mono text-slate-800 dark:text-slate-200">{filteredReservations.length}</strong> de <strong className="font-mono">{reservations.length}</strong> reservas
          </div>
          {(searchQuery || statusFilter !== 'all' || roomTypeFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setRoomTypeFilter('all');
              }}
              className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Reservations Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        {filteredReservations.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No se encontraron reservas con los criterios seleccionados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-50/60 dark:bg-slate-800/40">
                  <th className="py-3 px-4">Código / Huésped</th>
                  <th className="py-3 px-4">Habitación</th>
                  <th className="py-3 px-4">Fechas Estancia</th>
                  <th className="py-3 px-4">Noches / Total</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Operación Recepción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredReservations.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        {res.guestName}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                        {res.code} <span aria-hidden="true">·</span> {res.guestDocument}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-slate-100">
                        Hab. {res.roomNumber}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {res.roomType}
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono text-xs text-slate-600 dark:text-slate-300">
                      <div>In: {res.checkInDate}</div>
                      <div>Out: {res.checkOutDate}</div>
                    </td>

                    <td className="py-3 px-4 font-mono text-xs">
                      <div className="font-bold text-slate-900 dark:text-slate-100">
                        {formatCOP(res.totalAmount)}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {res.nightsCount} noche(s) · Anticipo: {formatCOP(res.depositAmount)}
                      </div>
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
                      <div className="text-[11px] text-slate-400 font-mono">
                        {res.source}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {res.status === 'Confirmada' && (
                          <button
                            onClick={() => onUpdateReservationStatus(res.id, 'En Estancia')}
                            title="Realizar Check-In"
                            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors cursor-pointer"
                          >
                            <LogIn className="w-3.5 h-3.5" />
                            <span>Check-In</span>
                          </button>
                        )}

                        {res.status === 'En Estancia' && (
                          <button
                            onClick={() => onUpdateReservationStatus(res.id, 'Completada')}
                            title="Realizar Check-Out"
                            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded transition-colors cursor-pointer"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Check-Out</span>
                          </button>
                        )}

                        <button
                          onClick={() => setVoucherModalRes(res)}
                          title="Imprimir Voucher de Reserva"
                          className="p-1.5 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Reservation Modal with Overbooking Shield */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl w-full max-w-xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Crear Reserva · Overbooking Shield Activo
                </h2>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Huésped Registrado *
                </label>
                <select
                  value={formGuestId}
                  onChange={(e) => setFormGuestId(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                >
                  {guests.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.firstName} {g.lastName} ({g.documentType} {g.documentNumber}) · Tel: {g.phone}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Habitación Seleccionada *
                </label>
                <select
                  value={formRoomId}
                  onChange={(e) => setFormRoomId(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                >
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      Habitación {r.number} - {r.type} (Capacidad: {r.capacity} pers) - {formatCOP(r.pricePerNight)} / noche
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Fecha Check-In *
                  </label>
                  <input
                    type="date"
                    required
                    value={formCheckIn}
                    onChange={(e) => setFormCheckIn(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Fecha Check-Out *
                  </label>
                  <input
                    type="date"
                    required
                    value={formCheckOut}
                    onChange={(e) => setFormCheckOut(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Cantidad de Personas
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={selectedRoom.capacity}
                    value={formGuestsCount}
                    onChange={(e) => setFormGuestsCount(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Canal de Reserva
                  </label>
                  <select
                    value={formSource}
                    onChange={(e) => setFormSource(e.target.value as any)}
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="Web Directa">Web Directa</option>
                    <option value="Recepción">Recepción Presencial</option>
                    <option value="Booking / OTA">Booking / OTA</option>
                    <option value="Telefónica">Telefónica</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Peticiones Especiales
                </label>
                <input
                  type="text"
                  value={formSpecialRequests}
                  onChange={(e) => setFormSpecialRequests(e.target.value)}
                  placeholder="e.g. Cama adicional, check-in tardío, vista al mar..."
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              {/* Real-time Conflict Alert or Approval Box */}
              {isConflictDetected ? (
                <div className="p-3 rounded-lg border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <strong>¡Conflicto de Sobreventa Detectado por Overbooking Shield!</strong>
                    <p className="mt-0.5 text-[11px] leading-tight">
                      La habitación {selectedRoom.number} ya cuenta con una reserva activa en ese rango de fechas. El controlador PHP bloqueará la inserción.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>Habitación Disponible · {nights} noche(s) calculadas</span>
                  </div>
                  <strong className="font-mono text-sm">{formatCOP(estimatedTotal)}</strong>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3.5 py-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isConflictDetected}
                  className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold cursor-pointer disabled:opacity-40"
                >
                  Confirmar Reserva en MySQL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Voucher Modal */}
      {voucherModalRes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="text-center pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                HOTEL LUNA AZUL
              </h3>
              <p className="text-xs text-slate-500">Comprobante Oficial de Reserva · XAMPP MySQL</p>
            </div>

            <div className="text-xs space-y-2 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Código Reserva:</span>
                <strong className="text-slate-900 dark:text-slate-100">{voucherModalRes.code}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Huésped:</span>
                <span className="text-slate-900 dark:text-slate-100 font-sans font-medium">{voucherModalRes.guestName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Documento:</span>
                <span>{voucherModalRes.guestDocument}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Habitación:</span>
                <span>#{voucherModalRes.roomNumber} ({voucherModalRes.roomType})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Check-In:</span>
                <span>{voucherModalRes.checkInDate} (15:00)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Check-Out:</span>
                <span>{voucherModalRes.checkOutDate} (11:00)</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 dark:border-slate-800 pt-2 font-sans text-sm">
                <strong>Total a Pagar:</strong>
                <strong className="font-mono text-blue-600 dark:text-blue-400">{formatCOP(voucherModalRes.totalAmount)}</strong>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setVoucherModalRes(null)}
                className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded cursor-pointer"
              >
                Cerrar
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Voucher</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

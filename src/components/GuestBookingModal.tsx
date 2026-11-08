import React, { useState } from 'react';
import { X, Calendar, User, CreditCard, CheckCircle2, ShieldCheck, Sparkles, MapPin, Download, AlertCircle } from 'lucide-react';
import { Room, Reservation } from '../types';

interface GuestBookingModalProps {
  rooms: Room[];
  selectedRoomId?: string;
  onClose: () => void;
  onSuccess: (resData: Omit<Reservation, 'id' | 'code' | 'createdAt' | 'updatedAt'>) => boolean;
}

export const GuestBookingModal: React.FC<GuestBookingModalProps> = ({
  rooms,
  selectedRoomId,
  onClose,
  onSuccess,
}) => {
  // Step 1: Dates & Room, Step 2: Guest info, Step 3: Confirmation Voucher
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Today and default 3-day stay
  const todayStr = new Date().toISOString().split('T')[0];
  const threeDaysLater = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [checkIn, setCheckIn] = useState<string>(todayStr);
  const [checkOut, setCheckOut] = useState<string>(threeDaysLater);
  const [adults, setAdults] = useState<number>(2);
  const [children, setChildren] = useState<number>(0);
  const [roomId, setRoomId] = useState<string>(selectedRoomId || rooms[0]?.id || '');

  // Guest details
  const [guestName, setGuestName] = useState<string>('');
  const [guestDoc, setGuestDoc] = useState<string>('');
  const [guestEmail, setGuestEmail] = useState<string>('');
  const [guestPhone, setGuestPhone] = useState<string>('');
  const [specialRequests, setSpecialRequests] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'transfer' | 'hotel'>('card');

  const [confirmedReservation, setConfirmedReservation] = useState<{
    code: string;
    totalAmount: number;
    roomNumber: string;
    roomType: string;
    nights: number;
  } | null>(null);

  const [errorMsg, setErrorMsg] = useState<string>('');

  const currentRoom = rooms.find((r) => r.id === roomId) || rooms[0];

  // Calculate nights and price
  const calculateNights = () => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  const nights = calculateNights();
  const roomPricePerNight = currentRoom?.pricePerNight || 350000;
  const subtotal = roomPricePerNight * nights;
  const hotelTaxes = Math.round(subtotal * 0.19); // 19% IVA hotelero
  const grandTotal = subtotal + hotelTaxes;

  const handleProceedToStep2 = () => {
    if (!checkIn || !checkOut) {
      setErrorMsg('Por favor ingrese las fechas de ingreso y salida');
      return;
    }
    if (new Date(checkOut) <= new Date(checkIn)) {
      setErrorMsg('La fecha de salida debe ser posterior a la fecha de ingreso');
      return;
    }
    setErrorMsg('');
    setStep(2);
  };

  const handleConfirmReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !guestDoc.trim() || !guestEmail.trim() || !guestPhone.trim()) {
      setErrorMsg('Por favor complete todos los campos de información personal obligatorios.');
      return;
    }

    const reservationPayload: Omit<Reservation, 'id' | 'code' | 'createdAt' | 'updatedAt'> = {
      guestId: `HUE-${Date.now().toString().slice(-4)}`,
      guestName: guestName.trim(),
      guestDocument: guestDoc.trim(),
      guestPhone: guestPhone.trim(),
      roomId: currentRoom.id,
      roomNumber: currentRoom.number,
      roomType: currentRoom.type,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      nightsCount: nights,
      guestsCount: adults + children,
      adultsCount: adults,
      childrenCount: children,
      pricePerNight: roomPricePerNight,
      totalAmount: grandTotal,
      depositAmount: paymentMethod === 'hotel' ? 0 : Math.round(grandTotal * 0.5),
      pendingAmount: paymentMethod === 'hotel' ? grandTotal : Math.round(grandTotal * 0.5),
      status: 'Confirmada',
      paymentStatus: paymentMethod === 'hotel' ? 'Pendiente' : 'Pagada',
      paymentMethod: paymentMethod === 'card' ? 'Tarjeta Crédito' : paymentMethod === 'transfer' ? 'Transferencia' : 'Efectivo en Recepción',
      specialRequests: specialRequests.trim() || 'Ninguna requerida',
      source: 'Web Directa',
    };

    const success = onSuccess(reservationPayload);
    if (success) {
      const generatedCode = `RES-2026-${Math.floor(100 + Math.random() * 900)}`;
      setConfirmedReservation({
        code: generatedCode,
        totalAmount: grandTotal,
        roomNumber: currentRoom.number,
        roomType: currentRoom.type,
        nights,
      });
      setStep(3);
    } else {
      setErrorMsg('Lo sentimos, esta habitación acaba de ser reservada para las fechas seleccionadas. Por favor elija otra suite.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-900 to-indigo-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-xs">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Reserva Directa · Hotel Luna Azul</h2>
              <p className="text-xs text-blue-200">Garantía de Mejor Tarifa Oficial · Santa Marta, Colombia</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-medium">
          <div className="flex items-center gap-2">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
            }`}>
              1
            </span>
            <span className={step >= 1 ? 'text-slate-900 dark:text-slate-100 font-semibold' : 'text-slate-400'}>
              Fechas & Suite
            </span>
          </div>
          <div className="h-0.5 w-12 bg-slate-200 dark:bg-slate-700" />
          <div className="flex items-center gap-2">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
            }`}>
              2
            </span>
            <span className={step >= 2 ? 'text-slate-900 dark:text-slate-100 font-semibold' : 'text-slate-400'}>
              Datos del Huésped
            </span>
          </div>
          <div className="h-0.5 w-12 bg-slate-200 dark:bg-slate-700" />
          <div className="flex items-center gap-2">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              step === 3 ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
            }`}>
              3
            </span>
            <span className={step === 3 ? 'text-emerald-600 font-semibold' : 'text-slate-400'}>
              Confirmación
            </span>
          </div>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 rounded-lg text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {step === 1 && (
            <div className="space-y-6">
              {/* Date selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    Fecha de Ingreso (Check-in a partir de las 15:00)
                  </label>
                  <input
                    type="date"
                    min={todayStr}
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    Fecha de Salida (Check-out hasta las 12:00)
                  </label>
                  <input
                    type="date"
                    min={checkIn || todayStr}
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Guests Count */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Adultos
                  </label>
                  <select
                    value={adults}
                    onChange={(e) => setAdults(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100"
                  >
                    <option value={1}>1 Adulto</option>
                    <option value={2}>2 Adultos</option>
                    <option value={3}>3 Adultos</option>
                    <option value={4}>4 Adultos</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Niños / Menores
                  </label>
                  <select
                    value={children}
                    onChange={(e) => setChildren(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100"
                  >
                    <option value={0}>Sin niños</option>
                    <option value={1}>1 Niño</option>
                    <option value={2}>2 Niños</option>
                    <option value={3}>3 Niños</option>
                  </select>
                </div>
              </div>

              {/* Suite Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Seleccione su Suite o Habitación
                </label>
                <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                  {rooms.map((room) => {
                    const isSelected = room.id === roomId;
                    return (
                      <div
                        key={room.id}
                        onClick={() => setRoomId(room.id)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 ring-1 ring-blue-600'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-slate-150 dark:bg-slate-700 flex flex-col items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
                            <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                              #{room.number}
                            </span>
                            <span className="text-[10px] text-slate-500">Piso {room.floor}</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                {room.type}
                              </h4>
                              <span className="text-[11px] px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded font-medium">
                                {room.bedType || 'Cama King'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                              {room.amenities.slice(0, 3).join(' · ')}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-sm font-bold text-blue-700 dark:text-blue-400">
                            ${room.pricePerNight.toLocaleString('es-CO')}
                          </div>
                          <span className="text-[10px] text-slate-400">COP / noche</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Price Calculation Breakdown */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>
                    Estancia: {nights} {nights === 1 ? 'noche' : 'noches'} × ${roomPricePerNight.toLocaleString('es-CO')}
                  </span>
                  <span className="font-mono text-slate-900 dark:text-slate-200">${subtotal.toLocaleString('es-CO')}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Impuestos hoteleros e IVA (19%)</span>
                  <span className="font-mono text-slate-900 dark:text-slate-200">${hotelTaxes.toLocaleString('es-CO')}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between font-bold text-sm text-slate-900 dark:text-slate-100">
                  <span>Total Estimado a Pagar</span>
                  <span className="text-blue-600 dark:text-blue-400">${grandTotal.toLocaleString('es-CO')} COP</span>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleConfirmReservation} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nombre Completo del Titular *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Carolina Gómez Restrepo"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Cédula / Pasaporte *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. CC 1020485960"
                    value={guestDoc}
                    onChange={(e) => setGuestDoc(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Correo Electrónico (Para envío de Voucher) *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="carolina.gomez@gmail.com"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Teléfono / WhatsApp de Contacto *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+57 315 889 4422"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Solicitudes Especiales (Opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Ej. Llegada tarde después de las 20:00, cuna para bebé, decoración de aniversario..."
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100"
                />
              </div>

              {/* Payment Mode Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Modalidad de Garantía / Pago
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                      paymentMethod === 'card'
                        ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-950 dark:text-blue-100 font-semibold ring-1 ring-blue-600'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 mb-1 text-blue-600" />
                    <div>Tarjeta de Crédito</div>
                    <span className="text-[10px] text-slate-400">Garantía en línea</span>
                  </div>

                  <div
                    onClick={() => setPaymentMethod('transfer')}
                    className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                      paymentMethod === 'transfer'
                        ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-950 dark:text-blue-100 font-semibold ring-1 ring-blue-600'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 mb-1 text-blue-600" />
                    <div>Transferencia Bancaria</div>
                    <span className="text-[10px] text-slate-400">Bancolombia / Nequi</span>
                  </div>

                  <div
                    onClick={() => setPaymentMethod('hotel')}
                    className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                      paymentMethod === 'hotel'
                        ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-950 dark:text-blue-100 font-semibold ring-1 ring-blue-600'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <MapPin className="w-4 h-4 mb-1 text-blue-600" />
                    <div>Pago en Recepción</div>
                    <span className="text-[10px] text-slate-400">Al realizar el Check-in</span>
                  </div>
                </div>
              </div>

              {/* Summary callout */}
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Reserva respaldada por el <strong>Overbooking Shield</strong> del Hotel Luna Azul. Confirmación en tiempo real protegida contra sobreventas.
                </span>
              </div>
            </form>
          )}

          {step === 3 && confirmedReservation && (
            <div className="text-center py-4 space-y-5">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  ¡Reserva Confirmada con Éxito!
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Hemos enviado los detalles completos de su estadía a{' '}
                  <strong className="text-slate-800 dark:text-slate-200">{guestEmail}</strong>.
                </p>
              </div>

              {/* Digital Voucher Card */}
              <div className="bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl p-5 text-left max-w-lg mx-auto shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3 mb-3">
                  <div>
                    <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400">
                      CÓDIGO DE RESERVA OFICIAL
                    </span>
                    <div className="text-lg font-mono font-bold text-blue-600 dark:text-blue-400">
                      {confirmedReservation.code}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400">ESTADO</span>
                    <div className="text-xs font-semibold px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 rounded">
                      CONFIRMADA
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400">Huésped Titular:</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{guestName}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Documento:</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{guestDoc}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Suite Asignada:</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      Hab. {confirmedReservation.roomNumber} ({confirmedReservation.roomType})
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">Estancia:</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      {checkIn} al {checkOut} ({confirmedReservation.nights} noches)
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Total Liquidado:</span>
                  <span className="text-base font-bold text-blue-700 dark:text-blue-400">
                    ${confirmedReservation.totalAmount.toLocaleString('es-CO')} COP
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-400 flex items-center justify-center gap-2">
                <MapPin className="w-4 h-4 text-blue-500" />
                <span>Hotel Luna Azul · Bahía de Santa Marta, Colombia · RNT # 84920-CO</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between">
          {step === 1 && (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleProceedToStep2}
                className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                Continuar a Datos del Huésped →
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer"
              >
                ← Volver a Fechas
              </button>
              <button
                type="button"
                onClick={handleConfirmReservation}
                className="px-6 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirmar y Reservar Ahora</span>
              </button>
            </>
          )}

          {step === 3 && (
            <div className="w-full flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Imprimir / Guardar Voucher</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                Entendido y Cerrar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Calendar,
  Users,
  Sparkles,
  MapPin,
  Star,
  CheckCircle2,
  Waves,
  UtensilsCrossed,
  Flower2,
  Compass,
  ArrowRight,
  ShieldCheck,
  Search,
  Phone,
  Mail,
  Clock,
  Coffee,
  Wifi,
  Tv,
  Eye,
} from 'lucide-react';
import { Room } from '../types';

import heroImg from '../assets/images/hotel_hero_luna_azul_1794168162799.jpg';
import suiteImg from '../assets/images/hotel_room_suite_1794168162993.jpg';
import poolImg from '../assets/images/hotel_pool_sunset_1794169462700.jpg';
import diningImg from '../assets/images/hotel_restaurant_dining_1794169462357.jpg';

interface VisitorHomeViewProps {
  rooms: Room[];
  onOpenBookingModal: (roomId?: string) => void;
  onOpenLookupModal: () => void;
  onNavigateStaffPms: () => void;
}

export const VisitorHomeView: React.FC<VisitorHomeViewProps> = ({
  rooms,
  onOpenBookingModal,
  onOpenLookupModal,
  onNavigateStaffPms,
}) => {
  // Booking Quick Bar State
  const todayStr = new Date().toISOString().split('T')[0];
  const threeDaysLater = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [filterType, setFilterType] = useState<string>('all');
  const [quickCheckIn, setQuickCheckIn] = useState<string>(todayStr);
  const [quickCheckOut, setQuickCheckOut] = useState<string>(threeDaysLater);
  const [quickGuests, setQuickGuests] = useState<number>(2);

  const filteredRooms = filterType === 'all'
    ? rooms
    : filterType === 'ocean'
    ? rooms.filter((r) => r.type.toLowerCase().includes('mar') || r.type.toLowerCase().includes('presidencial'))
    : filterType === 'suite'
    ? rooms.filter((r) => r.type.toLowerCase().includes('suite'))
    : rooms.filter((r) => r.type.toLowerCase().includes('familiar') || r.capacity >= 3);

  const guestReviews = [
    {
      id: 1,
      name: 'Mariana & Felipe Echeverri',
      city: 'Medellín, Colombia',
      rating: 5,
      date: 'Febrero 2026',
      comment:
        'Una experiencia mágica. La vista al atardecer desde la Suite Presidencial y la cena en el restaurante Marea Azul superaron todas nuestras expectativas. El servicio del personal es impecable.',
      stay: 'Suite Presidencial Vista al Mar · 4 noches',
    },
    {
      id: 2,
      name: 'David Van Der Berg',
      city: 'Ámsterdam, Países Bajos',
      rating: 5,
      date: 'Enero 2026',
      comment:
        'The best luxury hideaway in Santa Marta. The infinity pool overlooking the bay is world-class, and having the private boat trip to Tayrona arranged directly from the hotel dock was unforgettable.',
      stay: 'Master Suite Luna Azul · 5 noches',
    },
    {
      id: 3,
      name: 'Dra. Camila Santamaría',
      city: 'Bogotá D.C., Colombia',
      rating: 5,
      date: 'Enero 2026',
      comment:
        'Tranquilidad absoluta y privacidad total. El spa con aromaterapia de café de la Sierra Nevada es un sueño. Definitivamente volveremos en nuestras próximas vacaciones.',
      stay: 'Junior Suite Jardín Tropical · 3 noches',
    },
  ];

  return (
    <div className="space-y-20 pb-16">
      {/* HERO SECTION */}
      <section className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200/50 dark:border-slate-800/80">
        <div className="relative min-h-[580px] lg:min-h-[640px] flex items-center">
          {/* Background image */}
          <img
            src={heroImg}
            alt="Fachada y recepción de lujo Hotel Luna Azul Santa Marta"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          {/* Subtle gradient overlays for contrast and readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/40 to-transparent" />

          {/* Hero Content */}
          <div className="relative z-10 max-w-4xl mx-auto px-6 py-16 text-center lg:text-left w-full space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-medium tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Resort Exclusivo Frente al Mar · Bahía de Santa Marta</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
              Donde el Caribe y la Sierra se encuentran en perfecta armonía
            </h1>

            <p className="text-base sm:text-lg text-slate-200 max-w-2xl font-normal leading-relaxed">
              Bienvenido al <strong>Hotel Luna Azul</strong>. Suites de lujo con vista panorámica a la bahía, piscina infinita al atardecer, gastronomía marina de autor y hospitalidad caribeña de cinco estrellas.
            </p>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2 text-xs text-slate-300">
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="font-semibold text-white">4.9 / 5.0</span> (640+ opiniones)
              </div>
              <span className="hidden sm:inline text-slate-600">·</span>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>RNT # 84920-CO Vigente</span>
              </div>
              <span className="hidden sm:inline text-slate-600">·</span>
              <div className="flex items-center gap-1.5">
                <Coffee className="w-4 h-4 text-amber-300" />
                <span>Desayuno Caribeño Gourmet Incluido</span>
              </div>
            </div>

            {/* FLOATING BOOKING ENGINE BAR */}
            <div className="pt-6">
              <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl p-4 sm:p-5 shadow-2xl border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-slate-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                  {/* Check-In */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                      Llegada (Check-in)
                    </label>
                    <input
                      type="date"
                      min={todayStr}
                      value={quickCheckIn}
                      onChange={(e) => setQuickCheckIn(e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm font-medium bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Check-Out */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                      Salida (Check-out)
                    </label>
                    <input
                      type="date"
                      min={quickCheckIn || todayStr}
                      value={quickCheckOut}
                      onChange={(e) => setQuickCheckOut(e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm font-medium bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Guests */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-blue-600" />
                      Huéspedes
                    </label>
                    <select
                      value={quickGuests}
                      onChange={(e) => setQuickGuests(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs sm:text-sm font-medium bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={1}>1 Huésped</option>
                      <option value={2}>2 Huéspedes</option>
                      <option value={3}>3 Huéspedes</option>
                      <option value={4}>4 Huéspedes</option>
                      <option value={5}>5+ Huéspedes (Familiar)</option>
                    </select>
                  </div>

                  {/* Submit CTA */}
                  <div>
                    <button
                      type="button"
                      onClick={() => onOpenBookingModal()}
                      className="w-full px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer group"
                    >
                      <span>Reservar Ahora</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex flex-wrap items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Mejor precio oficial directo · Sin comisiones de intermediarios</span>
                  </div>
                  <button
                    type="button"
                    onClick={onOpenLookupModal}
                    className="text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Search className="w-3 h-3" />
                    <span>¿Ya tienes una reserva? Consulta tu voucher aquí</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SUITES & HABITACIONES SHOWCASE */}
      <section className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">
              Alojamiento de Lujo
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
              Nuestras Suites & Habitaciones
            </h2>
            <p className="text-sm text-slate-500 mt-1 max-w-xl">
              Espacios diseñados para el descanso absoluto, con vistas al Mar Caribe y la brisa de la Sierra Nevada.
            </p>
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                filterType === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              Todas ({rooms.length})
            </button>
            <button
              onClick={() => setFilterType('ocean')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                filterType === 'ocean'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              Vista al Mar
            </button>
            <button
              onClick={() => setFilterType('suite')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                filterType === 'suite'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              Suites de Lujo
            </button>
            <button
              onClick={() => setFilterType('family')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                filterType === 'family'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              Familiares
            </button>
          </div>
        </div>

        {/* Room Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredRooms.map((room) => (
            <div
              key={room.id}
              className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              {/* Room Card Image */}
              <div className="relative h-60 overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img
                  src={suiteImg}
                  alt={room.type}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-slate-950/70 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-bold text-white flex items-center gap-1.5">
                  <span>Habitación #{room.number}</span>
                  <span className="text-slate-400">·</span>
                  <span>Piso {room.floor}</span>
                </div>
                <div className="absolute top-3 right-3 bg-blue-600/90 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-bold text-white">
                  {room.bedType || 'Cama King Lujo'}
                </div>
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white bg-gradient-to-t from-slate-950/80 to-transparent p-2 rounded-lg">
                  <span className="flex items-center gap-1 font-medium">
                    <Users className="w-3.5 h-3.5 text-amber-300" />
                    Hasta {room.capacity} huéspedes
                  </span>
                  <span className="text-[11px] text-emerald-300 font-semibold">
                    ✓ Disponible ahora
                  </span>
                </div>
              </div>

              {/* Room Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {room.type}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    Espaciosa suite equipada con cama king size de alta gama, sábanas de 400 hilos, terraza privada y vista relajante.
                  </p>
                </div>

                {/* Amenities Badges */}
                <div className="flex flex-wrap gap-1.5">
                  {room.amenities.map((amenity, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1"
                    >
                      <Sparkles className="w-2.5 h-2.5 text-blue-500" />
                      {amenity}
                    </span>
                  ))}
                </div>

                {/* Pricing & CTA */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                      TARIFA POR NOCHE
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                        ${room.pricePerNight.toLocaleString('es-CO')}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">COP</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onOpenBookingModal(room.id)}
                    className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Reservar</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* EXPERIENCIAS & AMENIDADES EXCLUSIVAS */}
      <section className="space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Momentos Inolvidables
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100">
            Experiencias & Gastronomía en Luna Azul
          </h2>
          <p className="text-sm text-slate-500">
            Más que una estadía, un viaje sensorial con lo mejor de la cultura caribeña y el bienestar holístico.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Card 1: Infinity Pool */}
          <div className="relative rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800 group min-h-[380px] flex flex-col justify-end p-8 text-white">
            <img
              src={poolImg}
              alt="Piscina infinity al atardecer en Hotel Luna Azul"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
            
            <div className="relative z-10 space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600/80 backdrop-blur-md text-xs font-semibold">
                <Waves className="w-3.5 h-3.5" />
                <span>Piscina Infinita Panorámica</span>
              </div>
              <h3 className="text-2xl font-bold">Atardeceres Dorados sobre la Bahía</h3>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-lg">
                Sumérjase en nuestra piscina de horizonte infinito mientras disfruta de un coctel artesanal de frutas tropicales con vista directa a la puesta de sol en el Mar Caribe.
              </p>
              <div className="pt-2 text-xs text-amber-300 font-medium">
                Abierta de 07:00 a 22:00 · Barra de mixología caribeña
              </div>
            </div>
          </div>

          {/* Card 2: Restaurant Dining */}
          <div className="relative rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800 group min-h-[380px] flex flex-col justify-end p-8 text-white">
            <img
              src={diningImg}
              alt="Restaurante Marea Azul frente al mar"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
            
            <div className="relative z-10 space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-600/80 backdrop-blur-md text-xs font-semibold">
                <UtensilsCrossed className="w-3.5 h-3.5" />
                <span>Restaurante Marea Azul</span>
              </div>
              <h3 className="text-2xl font-bold">Gastronomía Caribeña & Cocina de Mar</h3>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-lg">
                Cenas románticas a la luz de las velas frente al mar. Saboree la pesca fresca del día, langosta al coco, arroces marineros y una cuidada selección de vinos internacionales.
              </p>
              <div className="pt-2 text-xs text-amber-300 font-medium">
                Desayuno, Almuerzo y Cena · Menú de degustación del chef
              </div>
            </div>
          </div>
        </div>

        {/* 2 Smaller Experience Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Flower2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Luna Azul Spa & Bienestar
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Masajes relajantes con aceites esenciales de café orgánico de la Sierra Nevada de Santa Marta, circuito de hidroterapia y rituales corporales desintoxicantes.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Expediciones Privadas al Tayrona
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Zarpe directamente desde el muelle del hotel en nuestras embarcaciones privadas hacia Bahía Concha, Cabo San Juan y las playas vírgenes del Parque Nacional Tayrona.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* WHY BOOK DIRECT WITH US */}
      <section className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-blue-900/60 space-y-8">
        <div className="max-w-3xl space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
            Beneficios Exclusivos de Reserva Directa
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            ¿Por qué reservar en nuestro sitio oficial?
          </h2>
          <p className="text-sm text-slate-300">
            Garantizamos la mejor atención personalizada sin intermediarios, con privilegios inmediatos para su estadía.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-amber-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white">Mejor Tarifa Garantizada</h4>
            <p className="text-xs text-slate-300">
              Precios transparentes y sin cargos sorpresa. Si encuentra una tarifa menor, la igualamos.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-amber-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white">Coctel de Bienvenida</h4>
            <p className="text-xs text-slate-300">
              Disfrute de nuestra bebida insignia a base de maracuyá y ron caribeño al momento del check-in.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-amber-300">
              <Clock className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white">Early Check-in Flexible</h4>
            <p className="text-xs text-slate-300">
              Prioridad de asignación anticipada de suite según disponibilidad el día de su llegada.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-amber-300">
              <Wifi className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white">Wi-Fi 6 de Alta Velocidad</h4>
            <p className="text-xs text-slate-300">
              Conexión de fibra óptica dedicada en todas las suites, piscinas y áreas comunes.
            </p>
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10">
          <div className="text-xs text-slate-300">
            ¿Tiene alguna consulta antes de viajar? Nuestro equipo de concierge está a su disposición 24/7.
          </div>
          <button
            type="button"
            onClick={() => onOpenBookingModal()}
            className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-colors cursor-pointer shrink-0"
          >
            Reservar Mi Estadía Ahora
          </button>
        </div>
      </section>

      {/* GUEST REVIEWS SECTION */}
      <section className="space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Testimonios
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            La Experiencia de Nuestros Huéspedes
          </h2>
          <p className="text-xs text-slate-500">
            Opiniones de viajeros que han hecho de Hotel Luna Azul su destino favorito en Colombia.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {guestReviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-1">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 italic leading-relaxed">
                  "{rev.comment}"
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {rev.name}
                </h4>
                <div className="text-[11px] text-slate-400 flex items-center justify-between mt-0.5">
                  <span>{rev.city}</span>
                  <span>{rev.date}</span>
                </div>
                <div className="text-[10px] text-blue-600 dark:text-blue-400 font-medium mt-1">
                  {rev.stay}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* UBICACIÓN & CONTACTO */}
      <section className="bg-slate-100 dark:bg-slate-900 rounded-3xl p-8 sm:p-10 border border-slate-200 dark:border-slate-800 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Ubicación Privilegiada
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
              En el Corazón del Caribe Colombiano
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Ubicado sobre la exclusiva Bahía de Santa Marta, a solo 15 minutos del Aeropuerto Internacional Simón Bolívar y a 25 minutos de la entrada principal al Parque Tayrona. Disfrute del sonido del mar con acceso directo a playa privada.
            </p>

            <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300 pt-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Carrera 1ra # 22-84, Sector Bahía Hermosa, Santa Marta, Magdalena, Colombia</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Línea Telefónica & Concierge: +57 (605) 438-9900 · WhatsApp: +57 318 450 9988</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                <span>reservas@hotellunaazul.com · atencion@hotellunaazul.com</span>
              </div>
            </div>
          </div>

          {/* Quick interactive self-service card + Staff PMS portal access */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-5 shadow-sm">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Atención al Huésped & Recepción
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                ¿Desea revisar su código de reserva o gestionar su check-in?
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={onOpenLookupModal}
                className="flex-1 px-4 py-2.5 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>Consultar Mi Reserva</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenBookingModal()}
                className="flex-1 px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>Nueva Reserva Online</span>
              </button>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-[11px] text-slate-400">
              <span>Personal del Hotel / Recepción:</span>
              <button
                type="button"
                onClick={onNavigateStaffPms}
                className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-semibold underline flex items-center gap-1 cursor-pointer"
              >
                <span>Acceder al Panel de Gestión PMS</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

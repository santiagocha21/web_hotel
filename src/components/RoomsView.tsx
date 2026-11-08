import React, { useState } from 'react';
import { Room, RoomStatus } from '../types';
import { BedDouble, Users, Check, Sparkles, Wrench, ShieldCheck, Tag } from 'lucide-react';

interface RoomsViewProps {
  rooms: Room[];
  onUpdateRoomStatus: (roomId: string, status: RoomStatus) => void;
  onNotify: (message: string, type: 'success' | 'info' | 'error') => void;
}

export const RoomsView: React.FC<RoomsViewProps> = ({
  rooms,
  onUpdateRoomStatus,
  onNotify,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredRooms = rooms.filter((r) => {
    const matchesType = filterType === 'all' || r.type === filterType;
    const matchesStatus = filterStatus === 'all' || r.status === filterStatus;
    return matchesType && matchesStatus;
  });

  const formatCOP = (val: number) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);
  };

  const getStatusBadge = (status: RoomStatus) => {
    switch (status) {
      case 'Disponible':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'Ocupada':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'Limpieza':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case 'Mantenimiento':
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Inventario de Habitaciones & Tarifas
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Control de disponibilidad, asignaciones y estado de mantenimiento en Hotel Luna Azul
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Categoría:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
            >
              <option value="all">Todas ({rooms.length})</option>
              <option value="Sencilla">Sencilla</option>
              <option value="Doble">Doble</option>
              <option value="Suite Deluxe">Suite Deluxe</option>
              <option value="Familiar">Familiar</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Estado:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
            >
              <option value="all">Todos los estados</option>
              <option value="Disponible">Disponible</option>
              <option value="Ocupada">Ocupada</option>
              <option value="Limpieza">En Limpieza</option>
              <option value="Mantenimiento">Mantenimiento</option>
            </select>
          </div>
        </div>

        <div className="text-slate-500 font-mono">
          Mostrando <strong className="text-slate-900 dark:text-slate-100">{filteredRooms.length}</strong> habitaciones
        </div>
      </div>

      {/* Room Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRooms.map((room) => (
          <div
            key={room.id}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden flex flex-col justify-between"
          >
            <div>
              {/* Room Photo */}
              <div className="relative h-44 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <img
                  src={room.image || '/src/assets/images/hotel_room_suite_1794168162993.jpg'}
                  alt={`Habitación ${room.number} Hotel Luna Azul`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white font-mono font-bold text-xs px-2.5 py-1 rounded-md">
                  Habitación {room.number}
                </div>
                <div className="absolute top-3 right-3">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${getStatusBadge(room.status)}`}>
                    {room.status}
                  </span>
                </div>
              </div>

              {/* Room Details */}
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {room.type}
                  </h3>
                  <div className="text-sm font-bold font-mono text-blue-600 dark:text-blue-400">
                    {formatCOP(room.pricePerNight)}
                    <span className="text-[10px] font-normal text-slate-400 block text-right">/ noche</span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                  {room.description}
                </p>

                <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 font-medium">
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>Hasta {room.capacity} persona(s)</span>
                  </div>
                  <span>·</span>
                  <div>Piso {room.floor}</div>
                </div>

                {/* Amenities */}
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] font-bold text-slate-400 tracking-wider">COMODIDADES</span>
                  <div className="flex flex-wrap gap-1">
                    {room.amenities.map((am, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                      >
                        {am}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Change Status Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Actualizar Estado:</span>
              <select
                value={room.status}
                onChange={(e) => {
                  const newStatus = e.target.value as RoomStatus;
                  onUpdateRoomStatus(room.id, newStatus);
                  onNotify(`Habitación ${room.number} ahora está "${newStatus}"`, 'info');
                }}
                className="p-1.5 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium cursor-pointer"
              >
                <option value="Disponible">Disponible</option>
                <option value="Ocupada">Ocupada</option>
                <option value="Limpieza">En Limpieza</option>
                <option value="Mantenimiento">Mantenimiento</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { HotelHeader } from './components/HotelHeader';
import { VisitorHomeView } from './components/VisitorHomeView';
import { GuestBookingModal } from './components/GuestBookingModal';
import { GuestLookupModal } from './components/GuestLookupModal';
import { HotelDashboardView } from './components/HotelDashboardView';
import { ReservationsView } from './components/ReservationsView';
import { GuestsView } from './components/GuestsView';
import { RoomsView } from './components/RoomsView';
import { PythonPricingView } from './components/PythonPricingView';
import { TechArchitectureView } from './components/TechArchitectureView';
import { HotelAdminView } from './components/HotelAdminView';
import { NotificationToast, ToastMessage } from './components/NotificationToast';

import {
  initialRooms,
  initialGuests,
  initialReservations,
  initialHotelSettings,
  initialHotelModules,
  initialHotelUsers,
  initialHotelAuditLogs,
} from './data/mockHotelData';
import { Room, Guest, Reservation, HotelSettings, HotelModuleConfig, HotelSystemUser, HotelAuditLog, RoomStatus } from './types';

export default function App() {
  // Navigation & View Mode
  const [currentTab, setCurrentTab] = useState<string>('visitor-home');
  const [isStaffMode, setIsStaffMode] = useState<boolean>(false);

  // Modals
  const [bookingModalOpen, setBookingModalOpen] = useState<boolean>(false);
  const [preSelectedRoomId, setPreSelectedRoomId] = useState<string | undefined>(undefined);
  const [lookupModalOpen, setLookupModalOpen] = useState<boolean>(false);

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Hotel PMS State
  const [rooms, setRooms] = useState<Room[]>(() => {
    const saved = localStorage.getItem('hotel_luna_azul_rooms');
    return saved ? JSON.parse(saved) : initialRooms;
  });

  const [guests, setGuests] = useState<Guest[]>(() => {
    const saved = localStorage.getItem('hotel_luna_azul_guests');
    return saved ? JSON.parse(saved) : initialGuests;
  });

  const [reservations, setReservations] = useState<Reservation[]>(() => {
    const saved = localStorage.getItem('hotel_luna_azul_reservations');
    return saved ? JSON.parse(saved) : initialReservations;
  });

  const [hotelSettings, setHotelSettings] = useState<HotelSettings>(initialHotelSettings);
  const [moduleConfig, setModuleConfig] = useState<HotelModuleConfig>(initialHotelModules);
  const [users, setUsers] = useState<HotelSystemUser[]>(initialHotelUsers);
  const [auditLogs, setAuditLogs] = useState<HotelAuditLog[]>(initialHotelAuditLogs);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Persist state
  useEffect(() => {
    localStorage.setItem('hotel_luna_azul_reservations', JSON.stringify(reservations));
  }, [reservations]);

  useEffect(() => {
    localStorage.setItem('hotel_luna_azul_guests', JSON.stringify(guests));
  }, [guests]);

  useEffect(() => {
    localStorage.setItem('hotel_luna_azul_rooms', JSON.stringify(rooms));
  }, [rooms]);

  const handleNotify = (text: string, type: 'success' | 'info' | 'error' = 'info') => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const logAudit = (action: HotelAuditLog['action'], entity: HotelAuditLog['entity'], details: string) => {
    const newLog: HotelAuditLog = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      userId: 'USR-01',
      userName: 'Santiago Chandillo (Recepción)',
      action,
      entity,
      details,
      ipAddress: '192.168.1.10',
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Open booking modal
  const handleOpenBooking = (roomId?: string) => {
    setPreSelectedRoomId(roomId);
    setBookingModalOpen(true);
  };

  // Guest & Admin Reservation Creation
  const handleAddReservation = (resData: Omit<Reservation, 'id' | 'code' | 'createdAt' | 'updatedAt'>): boolean => {
    // Overbooking Shield: Check for conflicting reservation
    if (moduleConfig.overbookingShield) {
      const hasConflict = reservations.some((r) => {
        if (r.roomId !== resData.roomId) return false;
        if (r.status === 'Cancelada' || r.status === 'Completada') return false;
        // Overlap condition: NOT (newOut <= existIn OR newIn >= existOut)
        return !(resData.checkOutDate <= r.checkInDate || resData.checkInDate >= r.checkOutDate);
      });

      if (hasConflict) {
        handleNotify('¡Conflicto de Sobreventa bloqueado por Overbooking Shield!', 'error');
        return false;
      }
    }

    const newRes: Reservation = {
      id: `RES-${Date.now().toString().slice(-4)}`,
      code: `RES-2026-${Math.floor(100 + Math.random() * 900)}`,
      ...resData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setReservations((prev) => [newRes, ...prev]);

    // Check if guest already exists, or register new guest profile
    const existingGuest = guests.find((g) => g.documentNumber === resData.guestDocument);
    if (existingGuest) {
      setGuests((prev) =>
        prev.map((g) =>
          g.id === existingGuest.id ? { ...g, totalStays: g.totalStays + 1 } : g
        )
      );
    } else {
      const nameParts = resData.guestName.split(' ');
      const newGuest: Guest = {
        id: `HUE-${Date.now().toString().slice(-4)}`,
        code: `HUE-${Math.floor(1000 + Math.random() * 9000)}`,
        firstName: nameParts[0] || resData.guestName,
        lastName: nameParts.slice(1).join(' ') || 'Huésped',
        documentType: 'CC',
        documentNumber: resData.guestDocument,
        nationality: 'Colombiana',
        city: 'Santa Marta',
        address: 'Sector Bahía Hermosa',
        emergencyContact: {
          name: 'Contacto Huésped',
          phone: resData.guestPhone,
        },
        email: `${resData.guestName.toLowerCase().replace(/\s+/g, '.')}@email.com`,
        phone: resData.guestPhone,
        totalStays: 1,
        vipStatus: 'Gold',
        createdAt: new Date().toISOString(),
      };
      setGuests((prev) => [newGuest, ...prev]);
    }

    logAudit('INSERT', 'RESERVAS', `Nueva reserva confirmada ${newRes.code} para ${newRes.guestName} en Hab. ${newRes.roomNumber}`);
    handleNotify(`Reserva ${newRes.code} confirmada y registrada en MySQL`, 'success');
    return true;
  };

  const handleUpdateReservationStatus = (resId: string, status: Reservation['status']) => {
    setReservations((prev) =>
      prev.map((r) => {
        if (r.id === resId) {
          if (status === 'En Estancia') {
            setRooms((rms) => rms.map((rm) => (rm.id === r.roomId ? { ...rm, status: 'Ocupada' } : rm)));
            logAudit('CHECK_IN', 'RESERVAS', `Check-in realizado para reserva ${r.code} en Hab. ${r.roomNumber}`);
            handleNotify(`Check-in confirmado para Habitación ${r.roomNumber}`, 'success');
          } else if (status === 'Completada') {
            setRooms((rms) => rms.map((rm) => (rm.id === r.roomId ? { ...rm, status: 'Limpieza' } : rm)));
            logAudit('CHECK_OUT', 'RESERVAS', `Check-out completado para reserva ${r.code}. Habitación enviada a limpieza.`);
            handleNotify(`Check-out finalizado. Habitación ${r.roomNumber} enviada a limpieza`, 'info');
          }
          return { ...r, status, updatedAt: new Date().toISOString() };
        }
        return r;
      })
    );
  };

  // Guest Actions
  const handleAddGuest = (guestData: Omit<Guest, 'id' | 'code' | 'createdAt' | 'totalStays'>) => {
    const newGuest: Guest = {
      id: `HUE-${Date.now().toString().slice(-4)}`,
      code: `HUE-${Math.floor(1000 + Math.random() * 9000)}`,
      ...guestData,
      totalStays: 1,
      createdAt: new Date().toISOString(),
    };
    setGuests((prev) => [newGuest, ...prev]);
    logAudit('INSERT', 'HUESPEDES', `Nuevo huésped registrado: ${newGuest.firstName} ${newGuest.lastName} (${newGuest.documentNumber})`);
  };

  const handleUpdateGuest = (id: string, data: Partial<Guest>) => {
    setGuests((prev) => prev.map((g) => (g.id === id ? { ...g, ...data } : g)));
    logAudit('UPDATE', 'HUESPEDES', `Datos actualizados de huésped ID #${id}`);
  };

  const handleDeleteGuest = (id: string) => {
    setGuests((prev) => prev.filter((g) => g.id !== id));
    logAudit('DELETE', 'HUESPEDES', `Huésped ID #${id} archivado`);
  };

  // Room Actions
  const handleUpdateRoomStatus = (roomId: string, status: RoomStatus) => {
    setRooms((prev) => prev.map((r) => (r.id === roomId ? { ...r, status } : r)));
    logAudit('UPDATE', 'HABITACIONES', `Estado de habitación ${roomId} actualizado a ${status}`);
  };

  // User Actions
  const handleToggleUserStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: u.status === 'Activo' ? 'Inactivo' : 'Activo' } : u))
    );
  };

  // Reset Data to Factory Default
  const handleResetData = () => {
    setRooms(initialRooms);
    setGuests(initialGuests);
    setReservations(initialReservations);
    setHotelSettings(initialHotelSettings);
    setModuleConfig(initialHotelModules);
    localStorage.removeItem('hotel_luna_azul_rooms');
    localStorage.removeItem('hotel_luna_azul_guests');
    localStorage.removeItem('hotel_luna_azul_reservations');
    logAudit('CONFIG', 'SISTEMA', 'Restauración de inventario hotelero a valores originales');
  };

  // Navigate directly to staff PMS
  const handleNavigateToStaffPms = () => {
    setIsStaffMode(true);
    setCurrentTab('dashboard');
  };

  const isVisitorView = !isStaffMode || currentTab.startsWith('visitor');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Header */}
      <HotelHeader
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab.startsWith('visitor')) {
            setIsStaffMode(false);
          }
          setCurrentTab(tab);
        }}
        onOpenNewReservation={() => handleOpenBooking()}
        onOpenLookupModal={() => setLookupModalOpen(true)}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        isStaffMode={isStaffMode}
        onToggleStaffMode={setIsStaffMode}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        {isVisitorView && (
          <VisitorHomeView
            rooms={rooms}
            onOpenBookingModal={(roomId) => handleOpenBooking(roomId)}
            onOpenLookupModal={() => setLookupModalOpen(true)}
            onNavigateStaffPms={handleNavigateToStaffPms}
          />
        )}

        {!isVisitorView && currentTab === 'dashboard' && (
          <HotelDashboardView
            rooms={rooms}
            guests={guests}
            reservations={reservations}
            hotelSettings={hotelSettings}
            onNavigateTab={setCurrentTab}
            onSelectReservation={() => setCurrentTab('reservations')}
            onNewReservation={() => setCurrentTab('reservations')}
            onQuickCheckIn={(id) => handleUpdateReservationStatus(id, 'En Estancia')}
            onQuickCheckOut={(id) => handleUpdateReservationStatus(id, 'Completada')}
          />
        )}

        {!isVisitorView && currentTab === 'reservations' && (
          <ReservationsView
            reservations={reservations}
            rooms={rooms}
            guests={guests}
            onAddReservation={handleAddReservation}
            onUpdateReservationStatus={handleUpdateReservationStatus}
            onNotify={handleNotify}
          />
        )}

        {!isVisitorView && currentTab === 'guests' && (
          <GuestsView
            guests={guests}
            onAddGuest={handleAddGuest}
            onUpdateGuest={handleUpdateGuest}
            onDeleteGuest={handleDeleteGuest}
            onNotify={handleNotify}
          />
        )}

        {!isVisitorView && currentTab === 'rooms' && (
          <RoomsView
            rooms={rooms}
            onUpdateRoomStatus={handleUpdateRoomStatus}
            onNotify={handleNotify}
          />
        )}

        {!isVisitorView && currentTab === 'pricing' && (
          <PythonPricingView rooms={rooms} onNotify={handleNotify} />
        )}

        {!isVisitorView && currentTab === 'tech' && (
          <TechArchitectureView
            reservations={reservations}
            rooms={rooms}
            guests={guests}
            onNotify={handleNotify}
          />
        )}

        {!isVisitorView && currentTab === 'admin' && (
          <HotelAdminView
            moduleConfig={moduleConfig}
            onUpdateModuleConfig={setModuleConfig}
            hotelSettings={hotelSettings}
            onUpdateHotelSettings={setHotelSettings}
            users={users}
            onToggleUserStatus={handleToggleUserStatus}
            auditLogs={auditLogs}
            reservations={reservations}
            rooms={rooms}
            guests={guests}
            onResetData={handleResetData}
            onNotify={handleNotify}
          />
        )}
      </main>

      {/* Interactive Guest Booking Modal */}
      {bookingModalOpen && (
        <GuestBookingModal
          rooms={rooms}
          selectedRoomId={preSelectedRoomId}
          onClose={() => setBookingModalOpen(false)}
          onSuccess={handleAddReservation}
        />
      )}

      {/* Guest Voucher Lookup Modal */}
      {lookupModalOpen && (
        <GuestLookupModal
          reservations={reservations}
          rooms={rooms}
          onClose={() => setLookupModalOpen(false)}
        />
      )}

      {/* Interactive Toast Notifications */}
      <NotificationToast toasts={toasts} onDismiss={handleDismissToast} />

      {/* Professional Luxury Hotel Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-10 text-xs text-slate-500 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                {hotelSettings.name}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {hotelSettings.tagline} · {hotelSettings.address}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
              <button
                type="button"
                onClick={() => {
                  setIsStaffMode(false);
                  setCurrentTab('visitor-home');
                }}
                className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
              >
                Inicio
              </button>
              <button
                type="button"
                onClick={() => handleOpenBooking()}
                className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
              >
                Reservar Suite
              </button>
              <button
                type="button"
                onClick={() => setLookupModalOpen(true)}
                className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
              >
                Consultar Voucher
              </button>
              <button
                type="button"
                onClick={handleNavigateToStaffPms}
                className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 underline cursor-pointer"
              >
                Acceso Recepción PMS
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
            <div>
              <span>{hotelSettings.legalBusinessName}</span>
              <span className="mx-2" aria-hidden="true">·</span>
              <span>NIT: {hotelSettings.nit}</span>
              <span className="mx-2" aria-hidden="true">·</span>
              <span>Registro Nacional de Turismo: {hotelSettings.rntNumber}</span>
            </div>
            <div>
              <span>Concierge: {hotelSettings.phone}</span>
              <span className="mx-2" aria-hidden="true">·</span>
              <span>Moneda Oficial: {hotelSettings.currency}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

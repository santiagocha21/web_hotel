export type RoomType = 'Sencilla' | 'Doble' | 'Suite Deluxe' | 'Familiar';
export type RoomStatus = 'Disponible' | 'Ocupada' | 'Limpieza' | 'Mantenimiento';
export type ReservationStatus = 'Confirmada' | 'En Estancia' | 'Completada' | 'Cancelada';

export interface Room {
  id: string;
  number: string;
  type: RoomType;
  floor: number;
  capacity: number;
  pricePerNight: number; // COP ($)
  status: RoomStatus;
  amenities: string[];
  description: string;
  image?: string;
  bedType?: string;
}

export interface Guest {
  id: string;
  code: string; // e.g. HUE-1001
  documentType: 'CC' | 'CE' | 'Pasaporte' | 'TI' | 'DNI';
  documentNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nationality: string;
  city: string;
  address: string;
  emergencyContact: {
    name: string;
    phone: string;
  };
  notes?: string;
  totalStays: number;
  createdAt: string;
  vipStatus?: string;
}

export interface Reservation {
  id: string;
  code: string; // e.g. RES-2026-001
  guestId: string;
  guestName: string;
  guestDocument: string;
  guestPhone: string;
  roomId: string;
  roomNumber: string;
  roomType: RoomType;
  checkInDate: string; // YYYY-MM-DD
  checkOutDate: string; // YYYY-MM-DD
  nightsCount: number;
  guestsCount: number;
  adultsCount?: number;
  childrenCount?: number;
  pricePerNight: number;
  totalAmount: number;
  depositAmount: number;
  pendingAmount: number;
  status: ReservationStatus;
  paymentStatus?: 'Pagada' | 'Garantizada' | 'Pendiente';
  paymentMethod?: string;
  specialRequests?: string;
  source: 'Web Directa' | 'Recepción' | 'Booking / OTA' | 'Telefónica';
  createdAt: string;
  updatedAt: string;
}

export interface HotelSettings {
  name: string;
  tagline?: string;
  legalBusinessName: string;
  nit: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  checkInTime: string;
  checkOutTime: string;
  totalRooms: number;
  currency: string;
  taxRate: number; // e.g. 19% IVA
  rntNumber: string; // Registro Nacional de Turismo
}

export interface HotelModuleConfig {
  overbookingShield: boolean;
  pythonDynamicPricing: boolean;
  housekeepingModule: boolean;
  guestLoyalty: boolean;
  onlineInvoicing: boolean;
  apiDeveloperPortal: boolean;
}

export interface HotelAuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE' | 'CHECK_IN' | 'CHECK_OUT' | 'CONFIG';
  entity: 'RESERVAS' | 'HUESPEDES' | 'HABITACIONES' | 'SISTEMA';
  details: string;
  ipAddress: string;
}

export interface HotelSystemUser {
  id: string;
  name: string;
  email: string;
  role: 'Gerente General' | 'Jefe de Recepción' | 'Auditor Nocturno' | 'Gobernante/a';
  shift: 'Mañana' | 'Tarde' | 'Noche';
  status: 'Activo' | 'Inactivo';
}

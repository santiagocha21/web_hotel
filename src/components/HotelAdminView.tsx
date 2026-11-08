import React, { useState } from 'react';
import { HotelModuleConfig, HotelSettings, HotelSystemUser, HotelAuditLog, Reservation, Room, Guest } from '../types';
import { Sliders, Database, ShieldCheck, Download, RotateCcw, Building, Users, ToggleLeft, ToggleRight } from 'lucide-react';

interface HotelAdminViewProps {
  moduleConfig: HotelModuleConfig;
  onUpdateModuleConfig: (config: HotelModuleConfig) => void;
  hotelSettings: HotelSettings;
  onUpdateHotelSettings: (settings: HotelSettings) => void;
  users: HotelSystemUser[];
  onToggleUserStatus: (userId: string) => void;
  auditLogs: HotelAuditLog[];
  reservations: Reservation[];
  rooms: Room[];
  guests: Guest[];
  onResetData: () => void;
  onNotify: (message: string, type: 'success' | 'info' | 'error') => void;
}

export const HotelAdminView: React.FC<HotelAdminViewProps> = ({
  moduleConfig,
  onUpdateModuleConfig,
  hotelSettings,
  onUpdateHotelSettings,
  users,
  onToggleUserStatus,
  auditLogs,
  reservations,
  rooms,
  guests,
  onResetData,
  onNotify,
}) => {
  const [activeTab, setActiveTab] = useState<'modules' | 'settings' | 'data' | 'users' | 'logs'>('modules');
  const [settingsForm, setSettingsForm] = useState<HotelSettings>({ ...hotelSettings });

  const handleToggleModule = (key: keyof HotelModuleConfig) => {
    const updated = {
      ...moduleConfig,
      [key]: !moduleConfig[key],
    };
    onUpdateModuleConfig(updated);
    onNotify(`Módulo "${key}" ${updated[key] ? 'habilitado' : 'deshabilitado'} en Hotel Luna Azul`, 'info');
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateHotelSettings(settingsForm);
    onNotify('Configuración institucional del Hotel Luna Azul actualizada', 'success');
  };

  const handleExportSqlDump = () => {
    let sql = `-- ========================================================\n`;
    sql += `-- HOTEL LUNA AZUL - BACKUP DUMP COMPLETO DE BASE DE DATOS\n`;
    sql += `-- Entorno: Servidor MySQL / Apache\n`;
    sql += `-- Generado: ${new Date().toISOString()}\n`;
    sql += `-- ========================================================\n\n`;

    sql += `CREATE DATABASE IF NOT EXISTS hotel_luna_azul CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\n`;
    sql += `USE hotel_luna_azul;\n\n`;

    rooms.forEach((r) => {
      sql += `INSERT INTO habitaciones (numero, tipo, piso, capacidad_personas, precio_noche, estado) VALUES ('${r.number}', '${r.type}', ${r.floor}, ${r.capacity}, ${r.pricePerNight}, '${r.status}');\n`;
    });
    sql += `\n`;

    guests.forEach((g) => {
      sql += `INSERT INTO huespedes (codigo, tipo_documento, documento_numero, nombres, apellidos, email, telefono, nacionalidad, ciudad_origen) VALUES ('${g.code}', '${g.documentType}', '${g.documentNumber}', '${g.firstName}', '${g.lastName}', '${g.email}', '${g.phone}', '${g.nationality}', '${g.city}');\n`;
    });
    sql += `\n`;

    reservations.forEach((res) => {
      sql += `INSERT INTO reservas (codigo, huesped_id, habitacion_id, fecha_ingreso, fecha_salida, cantidad_noches, cantidad_personas, precio_noche, monto_total, estado, canal_origen) VALUES ('${res.code}', 1, 1, '${res.checkInDate}', '${res.checkOutDate}', ${res.nightsCount}, ${res.guestsCount}, ${res.pricePerNight}, ${res.totalAmount}, '${res.status}', '${res.source}');\n`;
    });

    const blob = new Blob([sql], { type: 'text/sql;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `hotel_luna_azul_backup_${new Date().toISOString().slice(0, 10)}.sql`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onNotify('Copia de seguridad SQL descargada exitosamente', 'success');
  };

  const handleExportJson = () => {
    const data = JSON.stringify({ hotelSettings, rooms, guests, reservations, exportedAt: new Date().toISOString() }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `hotel_luna_azul_dataset_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onNotify('Dataset JSON exportado correctamente', 'success');
  };

  const modulesList: { key: keyof HotelModuleConfig; title: string; desc: string; tag: string }[] = [
    {
      key: 'overbookingShield',
      title: 'Overbooking Shield (Protección Anti-Sobreventa)',
      desc: 'Bloquea solapamientos de fechas en tiempo real en ReservaModel.php con consultas BETWEEN en MySQL.',
      tag: 'Core Crítico',
    },
    {
      key: 'pythonDynamicPricing',
      title: 'Motor Predictivo Python (Tarifas Dinámicas)',
      desc: 'Ajusta precios por noche de acuerdo con la ocupación del hotel y temporadas festivas.',
      tag: 'Revenue AI',
    },
    {
      key: 'housekeepingModule',
      title: 'Módulo de Housekeeping y Limpieza',
      desc: 'Flujo de preparación de habitaciones post check-out para recepción.',
      tag: 'Operaciones',
    },
    {
      key: 'guestLoyalty',
      title: 'Historial de Fidelización de Huéspedes',
      desc: 'Conteo automático de estancias pasadas y notas personalizadas de preferencias.',
      tag: 'CRM Huéspedes',
    },
    {
      key: 'onlineInvoicing',
      title: 'Comprobantes y Facturación Digital',
      desc: 'Emisión de vouchers con código QR y desglose de IVA 19% para el huésped.',
      tag: 'Contabilidad',
    },
    {
      key: 'apiDeveloperPortal',
      title: 'Portal de Desarrolladores & API REST',
      desc: 'Endpoints para sincronización con OTAs (Booking, Airbnb, Expedia) y arquitectura MVC.',
      tag: 'Integraciones',
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div>
        <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold tracking-wide">
          ADMINISTRACIÓN AVANZADA & GOBERNANZA DEL SISTEMA
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mt-1">
          Panel de Administración · Hotel Luna Azul
        </h1>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
          Personalice los módulos del sistema hotelero, configure los parámetros de la propiedad,
          genere copias de seguridad de la base de datos MySQL y audite transacciones de recepción.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('modules')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'modules'
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Personalización de Módulos</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          <span>Datos Corporativos</span>
        </button>

        <button
          onClick={() => setActiveTab('data')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'data'
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Respaldo MySQL</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'users'
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Personal de Recepción ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'logs'
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Auditoría de Transacciones ({auditLogs.length})</span>
        </button>
      </div>

      {/* Modules Switchboard */}
      {activeTab === 'modules' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Conmutador de Módulos Hotel Luna Azul
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Habilite o deshabilite funcionalidades de forma modular según las necesidades de la operación hotelera.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {modulesList.map((mod) => {
              const isEnabled = moduleConfig[mod.key];
              return (
                <div
                  key={mod.key}
                  className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {mod.title}
                      </h4>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {mod.tag}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {mod.desc}
                    </p>
                    <div className="pt-2 text-xs">
                      Estado: <strong className={isEnabled ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}>{isEnabled ? 'Habilitado y Activo' : 'Deshabilitado'}</strong>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleModule(mod.key)}
                    className="p-1 rounded text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer shrink-0"
                    title={isEnabled ? 'Desactivar módulo' : 'Activar módulo'}
                  >
                    {isEnabled ? (
                      <ToggleRight className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-slate-400" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Settings Form */}
      {activeTab === 'settings' && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-6 max-w-2xl">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4">
            Datos Comerciales y Facturación
          </h3>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Nombre Comercial</label>
              <input
                type="text"
                required
                value={settingsForm.name}
                onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Razón Social</label>
                <input
                  type="text"
                  required
                  value={settingsForm.legalBusinessName}
                  onChange={(e) => setSettingsForm({ ...settingsForm, legalBusinessName: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">NIT / RUT</label>
                <input
                  type="text"
                  required
                  value={settingsForm.nit}
                  onChange={(e) => setSettingsForm({ ...settingsForm, nit: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Registro Nacional de Turismo (RNT)</label>
                <input
                  type="text"
                  required
                  value={settingsForm.rntNumber}
                  onChange={(e) => setSettingsForm({ ...settingsForm, rntNumber: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Ciudad y Sede</label>
                <input
                  type="text"
                  required
                  value={settingsForm.city}
                  onChange={(e) => setSettingsForm({ ...settingsForm, city: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Hora Check-In</label>
                <input
                  type="time"
                  required
                  value={settingsForm.checkInTime}
                  onChange={(e) => setSettingsForm({ ...settingsForm, checkInTime: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Hora Check-Out</label>
                <input
                  type="time"
                  required
                  value={settingsForm.checkOutTime}
                  onChange={(e) => setSettingsForm({ ...settingsForm, checkOutTime: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">IVA Hotelero (%)</label>
                <input
                  type="number"
                  required
                  value={settingsForm.taxRate}
                  onChange={(e) => setSettingsForm({ ...settingsForm, taxRate: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                Actualizar Configuración
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Data Backup */}
      {activeTab === 'data' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
            <Database className="w-5 h-5 text-blue-600" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Respaldo SQL para Servidor MySQL
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Exporta el script DDL y DML completo para copias de seguridad de la base de datos central.
            </p>
            <button
              onClick={handleExportSqlDump}
              className="w-full py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Descargar SQL Dump</span>
            </button>
          </div>

          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
            <Download className="w-5 h-5 text-indigo-600" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Exportar Dataset JSON
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Exporta huéspedes, habitaciones y reservas en formato JSON para sincronización con OTAs o sistemas contables.
            </p>
            <button
              onClick={handleExportJson}
              className="w-full py-2 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Descargar JSON</span>
            </button>
          </div>

          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
            <RotateCcw className="w-5 h-5 text-amber-600" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Restaurar Valores por Defecto
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Reinicia los datos a los valores iniciales de demostración de la propiedad.
            </p>
            <button
              onClick={() => {
                if (window.confirm('¿Desea restaurar los datos al estado inicial de fábrica?')) {
                  onResetData();
                  onNotify('Datos restaurados a valores iniciales', 'info');
                }
              }}
              className="w-full py-2 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Restaurar Fábrica</span>
            </button>
          </div>
        </div>
      )}

      {/* Staff */}
      {activeTab === 'users' && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 font-semibold text-slate-600 dark:text-slate-300">
                  <th className="py-3 px-4">Nombre / ID</th>
                  <th className="py-3 px-4">Correo</th>
                  <th className="py-3 px-4">Rol</th>
                  <th className="py-3 px-4">Turno</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">{u.name}</div>
                      <div className="text-[11px] font-mono text-slate-400">{u.id}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">{u.email}</td>
                    <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">{u.role}</td>
                    <td className="py-3 px-4 text-slate-500">Turno {u.shift}</td>
                    <td className="py-3 px-4">
                      <span className={`font-semibold ${u.status === 'Activo' ? 'text-blue-600' : 'text-slate-400'}`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onToggleUserStatus(u.id)}
                        className="px-2.5 py-1 text-[11px] font-medium border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                      >
                        {u.status === 'Activo' ? 'Desactivar' : 'Activar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Audit Logs */}
      {activeTab === 'logs' && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 font-semibold text-slate-600 dark:text-slate-300">
                  <th className="py-3 px-4">Fecha y Hora</th>
                  <th className="py-3 px-4">Usuario</th>
                  <th className="py-3 px-4">Acción</th>
                  <th className="py-3 px-4">Entidad</th>
                  <th className="py-3 px-4">Detalle Transacción</th>
                  <th className="py-3 px-4 text-right">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 text-slate-500">{log.timestamp}</td>
                    <td className="py-3 px-4 font-sans font-medium text-slate-900 dark:text-slate-100">{log.userName}</td>
                    <td className="py-3 px-4">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        log.action === 'CHECK_IN'
                          ? 'bg-emerald-50 text-emerald-700'
                          : log.action === 'INSERT'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{log.entity}</td>
                    <td className="py-3 px-4 font-sans text-slate-700 dark:text-slate-300 max-w-sm">{log.details}</td>
                    <td className="py-3 px-4 text-right text-slate-400">{log.ipAddress}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

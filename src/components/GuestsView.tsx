import React, { useState, useMemo } from 'react';
import { Guest } from '../types';
import { Search, Plus, Download, UserCheck, Edit3, Trash2, Mail, Phone, MapPin, X } from 'lucide-react';

interface GuestsViewProps {
  guests: Guest[];
  onAddGuest: (guestData: Omit<Guest, 'id' | 'code' | 'createdAt' | 'totalStays'>) => void;
  onUpdateGuest: (id: string, guestData: Partial<Guest>) => void;
  onDeleteGuest: (id: string) => void;
  onNotify: (message: string, type: 'success' | 'info' | 'error') => void;
}

export const GuestsView: React.FC<GuestsViewProps> = ({
  guests,
  onAddGuest,
  onUpdateGuest,
  onDeleteGuest,
  onNotify,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);

  const [formData, setFormData] = useState({
    documentType: 'CC' as Guest['documentType'],
    documentNumber: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    nationality: 'Colombiana',
    city: 'Bogotá D.C.',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    notes: '',
  });

  const filteredGuests = useMemo(() => {
    return guests.filter((g) => {
      const q = searchQuery.toLowerCase().trim();
      return (
        !q ||
        g.firstName.toLowerCase().includes(q) ||
        g.lastName.toLowerCase().includes(q) ||
        g.documentNumber.includes(q) ||
        g.email.toLowerCase().includes(q) ||
        g.phone.includes(q)
      );
    });
  }, [guests, searchQuery]);

  const handleOpenCreate = () => {
    setEditingGuest(null);
    setFormData({
      documentType: 'CC',
      documentNumber: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      nationality: 'Colombiana',
      city: 'Bogotá D.C.',
      address: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      notes: '',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (guest: Guest) => {
    setEditingGuest(guest);
    setFormData({
      documentType: guest.documentType,
      documentNumber: guest.documentNumber,
      firstName: guest.firstName,
      lastName: guest.lastName,
      email: guest.email,
      phone: guest.phone,
      nationality: guest.nationality,
      city: guest.city,
      address: guest.address,
      emergencyContactName: guest.emergencyContact.name,
      emergencyContactPhone: guest.emergencyContact.phone,
      notes: guest.notes || '',
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.documentNumber.trim()) {
      onNotify('Nombres, apellidos y documento son obligatorios.', 'error');
      return;
    }

    if (editingGuest) {
      onUpdateGuest(editingGuest.id, {
        documentType: formData.documentType,
        documentNumber: formData.documentNumber,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        nationality: formData.nationality,
        city: formData.city,
        address: formData.address,
        emergencyContact: {
          name: formData.emergencyContactName,
          phone: formData.emergencyContactPhone,
        },
        notes: formData.notes,
      });
      onNotify('Huésped actualizado en MySQL', 'success');
    } else {
      onAddGuest({
        documentType: formData.documentType,
        documentNumber: formData.documentNumber,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        nationality: formData.nationality,
        city: formData.city,
        address: formData.address,
        emergencyContact: {
          name: formData.emergencyContactName,
          phone: formData.emergencyContactPhone,
        },
        notes: formData.notes,
      });
      onNotify('Nuevo huésped registrado exitosamente en base de datos', 'success');
    }
    setShowModal(false);
  };

  const handleExportCSV = () => {
    const headers = ['Codigo', 'TipoDoc', 'Documento', 'Nombres', 'Apellidos', 'Email', 'Telefono', 'Nacionalidad', 'Ciudad', 'Estancias'];
    const rows = filteredGuests.map((g) => [
      g.code,
      g.documentType,
      g.documentNumber,
      `"${g.firstName}"`,
      `"${g.lastName}"`,
      g.email,
      g.phone,
      `"${g.nationality}"`,
      `"${g.city}"`,
      g.totalStays,
    ]);

    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csv);
    link.download = `huespedes_hotel_luna_azul_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onNotify('Directorio de huéspedes exportado en CSV', 'success');
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Directorio de Huéspedes
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Gestión de clientes, historial de visitas y datos de contacto de Hotel Luna Azul
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
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Huésped</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por cédula, pasaporte, nombre o correo..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="text-xs text-slate-500 font-mono">
          Total: <strong className="text-slate-900 dark:text-slate-100">{filteredGuests.length}</strong> huéspedes
        </div>
      </div>

      {/* Guests Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-50/60 dark:bg-slate-800/40">
                <th className="py-3 px-4">Código / Nombre</th>
                <th className="py-3 px-4">Documento</th>
                <th className="py-3 px-4">Contacto</th>
                <th className="py-3 px-4">Origen</th>
                <th className="py-3 px-4">Estancias</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredGuests.map((guest) => (
                <tr key={guest.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900 dark:text-slate-100">
                      {guest.firstName} {guest.lastName}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                      {guest.code}
                    </div>
                  </td>

                  <td className="py-3 px-4 font-mono text-xs text-slate-700 dark:text-slate-300">
                    {guest.documentType} {guest.documentNumber}
                  </td>

                  <td className="py-3 px-4 text-xs">
                    <div className="flex items-center gap-1 text-slate-800 dark:text-slate-200">
                      <Mail className="w-3 h-3 text-slate-400" />
                      <span>{guest.email}</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-500 font-mono text-[11px] mt-0.5">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{guest.phone}</span>
                    </div>
                  </td>

                  <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-300">
                    <div>{guest.city}</div>
                    <div className="text-[11px] text-slate-400">{guest.nationality}</div>
                  </td>

                  <td className="py-3 px-4 font-mono tabular-nums text-xs font-semibold text-blue-600 dark:text-blue-400">
                    {guest.totalStays} visitas
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleOpenEdit(guest)}
                        title="Editar datos"
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`¿Desea archivar al huésped ${guest.firstName} ${guest.lastName}?`)) {
                            onDeleteGuest(guest.id);
                            onNotify('Huésped archivado en base de datos', 'info');
                          }
                        }}
                        title="Archivar"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Guest Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {editingGuest ? 'Editar Huésped' : 'Registrar Huésped en MySQL'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Nombres *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Apellidos *</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Tipo Doc.</label>
                  <select
                    value={formData.documentType}
                    onChange={(e) => setFormData({ ...formData, documentType: e.target.value as any })}
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="CC">Cédula (CC)</option>
                    <option value="Pasaporte">Pasaporte</option>
                    <option value="CE">Cédula Ext. (CE)</option>
                    <option value="TI">Tarjeta Id (TI)</option>
                    <option value="DNI">DNI</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Número de Documento *</label>
                  <input
                    type="text"
                    required
                    value={formData.documentNumber}
                    onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Correo Electrónico *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Teléfono Móvil *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Ciudad de Origen</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Nacionalidad</label>
                  <input
                    type="text"
                    value={formData.nationality}
                    onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Preferencias y Notas</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Almohada extra, habitación con vista al mar..."
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3.5 py-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold cursor-pointer"
                >
                  {editingGuest ? 'Guardar Cambios' : 'Registrar en MySQL'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

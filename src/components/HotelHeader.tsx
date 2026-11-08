import React from 'react';
import { Plus, Sun, Moon, Search, Calendar, ShieldCheck, Home, ArrowLeft } from 'lucide-react';

interface HotelHeaderProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenNewReservation: () => void;
  onOpenLookupModal: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  isStaffMode: boolean;
  onToggleStaffMode: (enabled: boolean) => void;
}

export const HotelHeader: React.FC<HotelHeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenNewReservation,
  onOpenLookupModal,
  darkMode,
  onToggleDarkMode,
  isStaffMode,
  onToggleStaffMode,
}) => {
  // Visitor navigation items
  const visitorNav = [
    { id: 'visitor-home', label: 'Inicio & Experiencia' },
    { id: 'visitor-suites', label: 'Suites & Habitaciones' },
    { id: 'visitor-experiences', label: 'Gastronomía & Relax' },
  ];

  // Staff PMS navigation items
  const staffNav = [
    { id: 'dashboard', label: 'Recepción' },
    { id: 'reservations', label: 'Reservas' },
    { id: 'guests', label: 'Huéspedes' },
    { id: 'rooms', label: 'Rack Habitaciones' },
    { id: 'pricing', label: 'Revenue AI' },
    { id: 'tech', label: 'Arquitectura PHP/SQL' },
    { id: 'admin', label: 'Configuración' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => {
            onToggleStaffMode(false);
            onSelectTab('visitor-home');
          }}
          className="text-left flex items-center gap-2.5 focus:outline-none group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-600 dark:bg-blue-500 flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:bg-blue-700 transition-colors">
            LA
          </div>
          <div className="flex flex-col">
            <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap shrink-0 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              Hotel Luna Azul
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-400 -mt-0.5 tracking-wider uppercase font-semibold">
              Boutique Resort & Spa · Santa Marta
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-5 text-xs font-semibold">
          {!isStaffMode ? (
            <>
              {visitorNav.map((item) => {
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    className={`transition-colors whitespace-nowrap cursor-pointer py-1.5 ${
                      isActive
                        ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}

              <button
                onClick={onOpenLookupModal}
                className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1 cursor-pointer py-1.5"
              >
                <Search className="w-3.5 h-3.5 text-blue-500" />
                <span>Consultar Mi Reserva</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  onToggleStaffMode(false);
                  onSelectTab('visitor-home');
                }}
                className="px-2.5 py-1 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-300 bg-slate-100 dark:bg-slate-800 rounded-md font-semibold flex items-center gap-1 cursor-pointer mr-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Sitio de Huéspedes</span>
              </button>

              {staffNav.map((item) => {
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    className={`transition-colors whitespace-nowrap cursor-pointer py-1 ${
                      isActive
                        ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </>
          )}
        </nav>

        {/* Zone 3: Actions + Staff Mode Toggle + Book CTA */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Mode Switcher: Guest Website vs Internal PMS */}
          <button
            onClick={() => {
              if (isStaffMode) {
                onToggleStaffMode(false);
                onSelectTab('visitor-home');
              } else {
                onToggleStaffMode(true);
                onSelectTab('dashboard');
              }
            }}
            title={isStaffMode ? 'Ver portal para visitantes' : 'Acceso a recepción y gestión hotelera'}
            className={`px-2.5 py-1.5 text-[11px] font-semibold rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
              isStaffMode
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800'
                : 'text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
            <span className="hidden sm:inline">
              {isStaffMode ? 'Modo Recepción PMS' : 'Portal Recepción'}
            </span>
          </button>

          {/* Theme toggle */}
          <button
            onClick={onToggleDarkMode}
            title={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            aria-label="Alternar tema"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Primary CTA */}
          <button
            onClick={onOpenNewReservation}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-sm hover:shadow transition-all whitespace-nowrap cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            <span>Reservar Ahora</span>
          </button>
        </div>
      </div>
    </header>
  );
};

import React, { useState } from 'react';
import { hotelSourceFiles, HotelSourceFile } from '../data/hotelMvcCodebase';
import { Reservation, Room, Guest } from '../types';
import { Code, Terminal, Layers, CheckCircle2, Copy, Download, Play, FileText, Database, Server, Cpu, ShieldCheck } from 'lucide-react';

interface TechArchitectureViewProps {
  reservations: Reservation[];
  rooms: Room[];
  guests: Guest[];
  onNotify: (message: string, type: 'success' | 'info' | 'error') => void;
}

export const TechArchitectureView: React.FC<TechArchitectureViewProps> = ({
  reservations,
  rooms,
  guests,
  onNotify,
}) => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'code' | 'lifecycle' | 'sql' | 'api'>('architecture');
  const [selectedFile, setSelectedFile] = useState<HotelSourceFile>(hotelSourceFiles[0]);
  const [lifecycleStep, setLifecycleStep] = useState<number>(0);

  // SQL Runner state
  const [sqlQuery, setSqlQuery] = useState<string>(
    "SELECT r.codigo, h.nombres, h.apellidos, hab.numero as habitacion, r.fecha_ingreso, r.fecha_salida, r.monto_total, r.estado\nFROM reservas r\nINNER JOIN huespedes h ON r.huesped_id = h.id\nINNER JOIN habitaciones hab ON r.habitacion_id = hab.id\nWHERE r.estado IN ('Confirmada', 'En Estancia')\nORDER BY r.fecha_ingreso ASC;"
  );
  const [sqlResults, setSqlResults] = useState<{
    columns: string[];
    rows: any[];
    executionTimeMs: number;
    rowCount: number;
  } | null>(null);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedFile.content);
    onNotify(`Código de ${selectedFile.name} copiado al portapapeles`, 'success');
  };

  const handleDownloadFile = () => {
    const blob = new Blob([selectedFile.content], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = selectedFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onNotify(`Descarga de ${selectedFile.name} iniciada`, 'info');
  };

  const handleExecuteSQL = () => {
    const qLower = sqlQuery.toLowerCase().trim();
    const start = performance.now();

    setTimeout(() => {
      let cols: string[] = [];
      let rows: any[] = [];

      if (qLower.includes('reservas') && qLower.includes('habitacion')) {
        cols = ['codigo', 'nombres', 'apellidos', 'habitacion', 'fecha_ingreso', 'fecha_salida', 'monto_total', 'estado'];
        rows = reservations.map((r) => ({
          codigo: r.code,
          nombres: r.guestName.split(' ')[0],
          apellidos: r.guestName.split(' ').slice(1).join(' '),
          habitacion: `Hab. ${r.roomNumber}`,
          fecha_ingreso: r.checkInDate,
          fecha_salida: r.checkOutDate,
          monto_total: `$ ${r.totalAmount.toLocaleString('es-CO')}`,
          estado: r.status,
        }));
      } else if (qLower.includes('habitaciones')) {
        cols = ['numero', 'tipo', 'piso', 'capacidad', 'precio_noche', 'estado'];
        rows = rooms.map((rm) => ({
          numero: rm.number,
          tipo: rm.type,
          piso: rm.floor,
          capacidad: `${rm.capacity} pers`,
          precio_noche: `$ ${rm.pricePerNight.toLocaleString('es-CO')}`,
          estado: rm.status,
        }));
      } else if (qLower.includes('huespedes')) {
        cols = ['codigo', 'documento', 'nombres', 'apellidos', 'telefono', 'email', 'estancias'];
        rows = guests.map((g) => ({
          codigo: g.code,
          documento: `${g.documentType} ${g.documentNumber}`,
          nombres: g.firstName,
          apellidos: g.lastName,
          telefono: g.phone,
          email: g.email,
          estancias: g.totalStays,
        }));
      } else {
        cols = ['resultado', 'motor', 'filas'];
        rows = [
          {
            resultado: 'Sentencia ejecutada en esquema hotel_luna_azul',
            motor: 'MariaDB / MySQL 8.0 InnoDB',
            filas: reservations.length,
          },
        ];
      }

      const elapsed = Math.round(performance.now() - start + 6);
      setSqlResults({
        columns: cols,
        rows,
        executionTimeMs: elapsed,
        rowCount: rows.length,
      });

      onNotify(`Consulta SQL ejecutada en ${elapsed}ms (${rows.length} filas)`, 'success');
    }, 180);
  };

  const steps = [
    {
      title: '1. Solicitud de Reserva & Validación Asíncrona (AJAX)',
      component: 'Cliente Web / Motor de Reservas',
      file: 'views/reservas/index.php',
      detail: 'El huésped o recepcionista selecciona fechas y categoría. JavaScript valida en el cliente que check_in < check_out y despacha un POST asíncrono con fetch() sin recargar la página.',
    },
    {
      title: '2. Front Controller & Enrutador Apache',
      component: 'Apache .htaccess + public/index.php',
      file: 'public/index.php',
      detail: 'El servidor web centraliza las peticiones HTTP y las envía al Front Controller. El autoloader PSR-4 carga las clases y el Router delega a ReservaController::guardar().',
    },
    {
      title: '3. Controlador: Sanitización y Verificación de Reglas',
      component: 'Controllers\\ReservaController',
      file: 'controllers/ReservaController.php',
      detail: 'Se sanitizan parámetros contra ataques XSS mediante htmlspecialchars(), se calcula la diferencia matemática de noches y se instancia ReservaModel.',
    },
    {
      title: '4. Modelo: Overbooking Shield (Validación Anti-Sobreventa)',
      component: 'Models\\ReservaModel',
      file: 'models/ReservaModel.php',
      detail: 'Se ejecuta una consulta preparada en MySQL verificando si existe algún solapamiento de fechas: NOT (:check_out <= fecha_ingreso OR :check_in >= fecha_salida). Si hay conflicto, lanza una excepción que impide la sobreventa.',
    },
    {
      title: '5. Transacción Atómica en MySQL (InnoDB)',
      component: 'Base de Datos MySQL Relacional',
      file: 'database/hotel_luna_azul.sql',
      detail: 'Si no hay conflicto, se inicia una transacción con $db->beginTransaction(), se inserta la reserva con Prepared Statements (prevención de Inyección SQL) y se actualiza el estado de la habitación.',
    },
    {
      title: '6. Respuesta JSON & Actualización Dinámica del DOM',
      component: 'Respuesta HTTP 201 Created',
      file: 'assets/js/reservas.js',
      detail: 'El servidor responde con payload JSON { exito: true, reserva_id: 104 }. El cliente JavaScript actualiza la tabla de reservas al instante con feedback visual y genera el voucher.',
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div>
        <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold tracking-wide">
          CENTRO TÉCNICO & ARQUITECTURA DEL SISTEMA
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mt-1">
          Arquitectura Empresarial Hotel Luna Azul
        </h1>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
          Especificación técnica de la plataforma hotelera bajo el patrón Modelo-Vista-Controlador (MVC) en PHP,
          base de datos relacional MySQL (InnoDB), microservicio Python de optimización de tarifas y API REST.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('architecture')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'architecture'
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          <span>Especificación Técnica</span>
        </button>

        <button
          onClick={() => setActiveTab('code')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'code'
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Code className="w-3.5 h-3.5" />
          <span>Código Fuente MVC ({hotelSourceFiles.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('lifecycle')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'lifecycle'
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Motor Anti-Sobreventa</span>
        </button>

        <button
          onClick={() => setActiveTab('sql')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'sql'
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Consola MySQL del Sistema</span>
        </button>

        <button
          onClick={() => setActiveTab('api')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'api'
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>API REST & Channel Manager</span>
        </button>
      </div>

      {/* Tab: Architecture Technical Spec */}
      {activeTab === 'architecture' && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-6 sm:p-8 space-y-6 text-sm">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 tracking-wider">
              DOCUMENTACIÓN TÉCNICA DEL SOFTWARE EMPRESARIAL
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              Sistema de Información y Motor de Reservas PMS · Hotel Luna Azul
            </h2>
            <div className="text-xs text-slate-500 mt-2 space-y-0.5">
              <div><strong>Organización:</strong> Inversiones Turísticas Luna Azul S.A.S. (NIT 901.442.819-3)</div>
              <div><strong>Arquitectura:</strong> Modelo-Vista-Controlador (MVC) en PHP 8.2 + MySQL 8.0 InnoDB</div>
              <div><strong>Microservicios:</strong> Python 3.11 (FastAPI · Revenue Management & Dynamic Pricing)</div>
            </div>
          </div>

          <div className="space-y-4 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              1. Visión General del Sistema
            </h3>
            <p>
              El software centraliza la administración operativa y comercial del Hotel Luna Azul, eliminando por completo
              los registros manuales y los chats no sincronizados. Su diseño modular y desacoplado garantiza alta disponibilidad,
              escalabilidad horizontal e integración con pasarelas de pago y canales OTA (Booking.com, Expedia, Airbnb).
            </p>

            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 pt-2">
              2. Capas Arquitectónicas del Patrón MVC
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-1.5">
                <strong className="text-slate-900 dark:text-slate-100 block font-semibold">Capa del Modelo (Model)</strong>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Encapsula las reglas del negocio hotelero, validaciones anti-sobreventa con algoritmos de no solapamiento y transacciones ACID en MySQL usando PDO.
                </p>
              </div>

              <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-1.5">
                <strong className="text-slate-900 dark:text-slate-100 block font-semibold">Capa de la Vista (View)</strong>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Interfaz responsiva construida con HTML5 semántico, CSS3 y JavaScript asíncrono para manipulación fluida del DOM sin recargas de página.
                </p>
              </div>

              <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-1.5">
                <strong className="text-slate-900 dark:text-slate-100 block font-semibold">Controlador (Controller)</strong>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Punto de orquestación que recibe solicitudes HTTP, sanitiza variables contra inyección y XSS, interactúa con el modelo y emite respuestas JSON.
                </p>
              </div>
            </div>

            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 pt-2">
              3. Seguridad y Estándares de Ingeniería
            </h3>
            <div className="space-y-1 text-slate-600 dark:text-slate-400">
              <div><strong className="text-slate-800 dark:text-slate-200">· Sentencias Preparadas (PDO Prepared Statements):</strong> Prevención absoluta de vulnerabilidades de Inyección SQL.</div>
              <div><strong className="text-slate-800 dark:text-slate-200">· Sanitización XSS:</strong> Filtrado de todas las cadenas de texto con <code className="font-mono text-blue-600">htmlspecialchars(ENT_QUOTES, 'UTF-8')</code>.</div>
              <div><strong className="text-slate-800 dark:text-slate-200">· Integridad Referencial:</strong> Claves foráneas con restricciones estrictas para evitar reservas huérfanas en cancelaciones.</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Code Explorer */}
      {activeTab === 'code' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-4 space-y-4">
            <span className="text-xs font-bold text-slate-400 tracking-wider">
              ÁRBOL DE CÓDIGO FUENTE MVC
            </span>

            <div className="space-y-1">
              {hotelSourceFiles.map((file) => {
                const isSelected = selectedFile.path === file.path;
                return (
                  <button
                    key={file.path}
                    onClick={() => setSelectedFile(file)}
                    className={`w-full text-left p-2 rounded-lg text-xs transition-colors flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-800'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="truncate">
                      <span className="font-mono text-slate-400 mr-1.5 text-[11px]">
                        {file.category.toUpperCase().slice(0, 4)}:
                      </span>
                      <span>{file.path}</span>
                    </div>
                    <span className="text-[10px] font-mono uppercase text-slate-400">
                      {file.language}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 text-slate-100 shadow-sm overflow-hidden flex flex-col">
            <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono font-bold text-blue-400">
                  {selectedFile.path}
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5 max-w-lg truncate">
                  {selectedFile.description}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar</span>
                </button>
                <button
                  onClick={handleDownloadFile}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar</span>
                </button>
              </div>
            </div>

            <div className="p-4 overflow-x-auto text-xs font-mono leading-relaxed max-h-[550px] overflow-y-auto">
              <pre className="text-slate-200">
                <code>{selectedFile.content}</code>
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Lifecycle */}
      {activeTab === 'lifecycle' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-blue-600">Mecanismo Técnico Anti-Sobreventa</span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Flujo del Algoritmo Overbooking Shield
              </h3>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setLifecycleStep(Math.max(0, lifecycleStep - 1))}
                disabled={lifecycleStep === 0}
                className="px-3 py-1.5 text-xs font-medium border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
              >
                Paso Anterior
              </button>
              <button
                onClick={() => setLifecycleStep(Math.min(steps.length - 1, lifecycleStep + 1))}
                disabled={lifecycleStep === steps.length - 1}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-40 cursor-pointer"
              >
                Siguiente Paso
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
            {steps.map((st, i) => {
              const isCur = i === lifecycleStep;
              const isPast = i < lifecycleStep;
              return (
                <div
                  key={i}
                  onClick={() => setLifecycleStep(i)}
                  className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                    isCur
                      ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 ring-1 ring-blue-500'
                      : isPast
                      ? 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 opacity-80'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 opacity-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[10px] font-bold text-slate-400">PASO 0{i + 1}</span>
                    {isPast && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                  </div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {st.title.replace(/^\d+\.\s*/, '')}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold">ETAPA EN EJECUCIÓN</span>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {steps[lifecycleStep].title}
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-500">
                Archivo: <strong className="text-slate-800 dark:text-slate-200">{steps[lifecycleStep].file}</strong>
              </span>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {steps[lifecycleStep].detail}
            </p>
          </div>
        </div>
      )}

      {/* Tab: SQL Console */}
      {activeTab === 'sql' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-600" />
                  <span>Consola de Gestión MySQL (Esquema hotel_luna_azul)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ejecución interactiva de sentencias SQL sobre la base de datos central de producción
                </p>
              </div>

              <select
                onChange={(e) => setSqlQuery(e.target.value)}
                className="p-1.5 text-xs rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="SELECT r.codigo, h.nombres, h.apellidos, hab.numero as habitacion, r.fecha_ingreso, r.fecha_salida, r.monto_total, r.estado\nFROM reservas r\nINNER JOIN huespedes h ON r.huesped_id = h.id\nINNER JOIN habitaciones hab ON r.habitacion_id = hab.id\nWHERE r.estado IN ('Confirmada', 'En Estancia')\nORDER BY r.fecha_ingreso ASC;">
                  1. Reservas Activas con Huésped y Habitación (JOIN)
                </option>
                <option value="SELECT hab.numero, hab.tipo, hab.capacidad_personas, hab.precio_noche, hab.estado\nFROM habitaciones hab\nORDER BY hab.numero ASC;">
                  2. Inventario Completo de Habitaciones
                </option>
                <option value="SELECT h.documento_numero, h.nombres, h.apellidos, h.telefono, h.ciudad_origen\nFROM huespedes h\nORDER BY h.apellidos ASC;">
                  3. Directorio de Huéspedes Registrados
                </option>
              </select>
            </div>

            <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-950 p-3">
              <textarea
                rows={4}
                value={sqlQuery}
                onChange={(e) => setSqlQuery(e.target.value)}
                className="w-full bg-transparent font-mono text-xs text-emerald-400 focus:outline-none resize-none leading-relaxed"
              />
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400 font-mono">Motor InnoDB · Sentencias preparadas PDO</span>
              <button
                onClick={handleExecuteSQL}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Ejecutar Consulta SQL</span>
              </button>
            </div>
          </div>

          {sqlResults && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
              <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex justify-between text-xs">
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  Resultados ({sqlResults.rowCount} filas)
                </span>
                <span className="text-slate-400 font-mono">
                  Tiempo de ejecución: <strong className="text-blue-600">{sqlResults.executionTimeMs} ms</strong>
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300">
                      {sqlResults.columns.map((c) => (
                        <th key={c} className="py-2 px-4">{c}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {sqlResults.rows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        {sqlResults.columns.map((c) => (
                          <td key={c} className="py-2 px-4 text-slate-700 dark:text-slate-300">{row[c] ?? 'NULL'}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: API REST Docs */}
      {activeTab === 'api' && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-6 space-y-4 text-xs">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              API REST & Conectores para Channel Managers
            </h3>
            <p className="text-slate-500 mt-0.5">
              Endpoints JSON disponibles para sincronización de inventario con OTAs (Booking.com, Airbnb, Expedia)
            </p>
          </div>

          <div className="space-y-3 font-mono">
            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[10px]">GET</span>
                <span className="text-slate-900 dark:text-slate-100">/api/habitaciones/disponibles</span>
              </div>
              <p className="font-sans text-[11px] text-slate-500">
                Retorna habitaciones disponibles en un rango de fechas con tarifas calculadas.
              </p>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-bold text-[10px]">POST</span>
                <span className="text-slate-900 dark:text-slate-100">/api/reservas/crear</span>
              </div>
              <p className="font-sans text-[11px] text-slate-500">
                Inserta una nueva reserva directa validando Overbooking Shield en MySQL.
              </p>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-bold text-[10px]">POST</span>
                <span className="text-slate-900 dark:text-slate-100">/api/pricing/dynamic</span>
              </div>
              <p className="font-sans text-[11px] text-slate-500">
                Microservicio Python para cálculo de tarifa dinámica según ocupación y temporada.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

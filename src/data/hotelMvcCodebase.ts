export interface HotelSourceFile {
  path: string;
  name: string;
  category: 'Config' | 'Core' | 'Model' | 'Controller' | 'View' | 'Python Microservice' | 'MySQL DDL';
  language: 'php' | 'python' | 'sql' | 'html';
  description: string;
  content: string;
}

export const hotelSourceFiles: HotelSourceFile[] = [
  {
    path: 'config/Database.php',
    name: 'Database.php',
    category: 'Config',
    language: 'php',
    description: 'Gestor de conexión Singleton a base de datos MySQL en entorno empresarial con PDO, charset utf8mb4 y manejo estricto de excepciones.',
    content: `<?php
/**
 * Hotel Luna Azul - Sistema de Gestión Hotelera & Reservas MVC
 * Archivo: config/Database.php
 * Propósito: Conexión segura Singleton mediante PDO para servidor web Apache / MySQL
 */

namespace Config;

use PDO;
use PDOException;

class Database {
    private static ?Database $instance = null;
    private ?PDO $connection = null;

    private string $host = '127.0.0.1';
    private string $dbName = 'hotel_luna_azul';
    private string $username = 'luna_azul_admin';
    private string $password = 'SecureLuna2026*';
    private int $port = 3306;

    private function __construct() {
        $dsn = "mysql:host={$this->host};port={$this->port};dbname={$this->dbName};charset=utf8mb4";
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false, // Seguridad: previene inyección SQL nativa
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
        ];

        try {
            $this->connection = new PDO($dsn, $this->username, $this->password, $options);
        } catch (PDOException $e) {
            error_log("Fallo de conexión en Hotel Luna Azul: " . $e->getMessage());
            die(json_encode([
                "status" => "error",
                "message" => "Error de conexión a la base de datos central de Hotel Luna Azul."
            ]));
        }
    }

    public static function getInstance(): Database {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function getConnection(): PDO {
        return $this->connection;
    }

    private function __clone() {}
    public function __wakeup() {
        throw new \\Exception("No se permite deserializar el Singleton de conexión.");
    }
}
`,
  },
  {
    path: 'models/ReservaModel.php',
    name: 'ReservaModel.php',
    category: 'Model',
    language: 'php',
    description: 'Modelo de Reservas con motor anti-sobreventa (Overbooking Shield). Valida disponibilidad de fechas en MySQL con consultas seguras y transacciones ACID.',
    content: `<?php
/**
 * Hotel Luna Azul - Modelo de Reservas
 * Archivo: models/ReservaModel.php
 * Control de disponibilidad temporal, cálculo de tarifas y transacciones de reservas
 */

namespace Models;

use Config\\Database;
use PDO;
use Exception;

class ReservaModel {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    /**
     * ALGORITMO CRÍTICO ANTI-SOBREVENTA (OVERBOOKING SHIELD):
     * Verifica si una habitación específica ya está ocupada o reservada en el rango [check_in, check_out].
     * Condición matemática de no solapamiento:
     * (:salida_solicitada <= fecha_ingreso_existente OR :ingreso_solicitado >= fecha_salida_existente)
     */
    public function verificarDisponibilidad(int $habitacionId, string $checkIn, string $checkOut, ?int $excluirReservaId = null): bool {
        $sql = "SELECT COUNT(*) as conflictos FROM reservas 
                WHERE habitacion_id = :habitacion_id 
                AND estado IN ('Confirmada', 'En Estancia')
                AND NOT (:check_out <= fecha_ingreso OR :check_in >= fecha_salida)";
        
        $params = [
            'habitacion_id' => $habitacionId,
            'check_in'      => $checkIn,
            'check_out'     => $checkOut
        ];

        if ($excluirReservaId !== null) {
            $sql .= " AND id != :excluir_id";
            $params['excluir_id'] = $excluirReservaId;
        }

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $result = $stmt->fetch();

        // Si conflictos == 0, la habitación está libre
        return (int)$result['conflictos'] === 0;
    }

    /**
     * Obtiene el listado completo de reservas con JOIN a huéspedes y habitaciones
     */
    public function getAll(string $filtroEstado = '', string $buscar = ''): array {
        $sql = "SELECT r.*, 
                       h.nombres, h.apellidos, h.documento_numero, h.telefono, h.email,
                       hab.numero as habitacion_numero, hab.tipo as habitacion_tipo, hab.precio_noche
                FROM reservas r
                INNER JOIN huespedes h ON r.huesped_id = h.id
                INNER JOIN habitaciones hab ON r.habitacion_id = hab.id
                WHERE 1=1";

        $params = [];

        if (!empty($filtroEstado)) {
            $sql .= " AND r.estado = :estado";
            $params['estado'] = $filtroEstado;
        }

        if (!empty($buscar)) {
            $sql .= " AND (h.nombres LIKE :busc OR h.apellidos LIKE :busc OR h.documento_numero LIKE :busc OR r.codigo LIKE :busc)";
            $params['busc'] = "%{$buscar}%";
        }

        $sql .= " ORDER BY r.fecha_ingreso ASC, r.id DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    /**
     * Registra una nueva reserva con transacción ACID para garantizar consistencia total
     */
    public function crearReserva(array $datos): int {
        // Paso 1: Validación estricta anti-sobreventa antes de insertar
        if (!$this->verificarDisponibilidad((int)$datos['habitacion_id'], $datos['fecha_ingreso'], $datos['fecha_salida'])) {
            throw new Exception("Conflicto de reserva: La habitación seleccionada ya no está disponible en las fechas indicadas.");
        }

        $this->db->beginTransaction();

        try {
            $sql = "INSERT INTO reservas 
                    (codigo, huesped_id, habitacion_id, fecha_ingreso, fecha_salida, 
                     cantidad_noches, cantidad_personas, precio_noche, monto_total, 
                     monto_anticipo, estado, solicitudes_especiales, canal_origen, created_at)
                    VALUES 
                    (:codigo, :huesped_id, :habitacion_id, :fecha_ingreso, :fecha_salida, 
                     :noches, :personas, :precio_noche, :total, 
                     :anticipo, :estado, :solicitudes, :canal, NOW())";

            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                'codigo'        => 'RES-' . date('Y') . '-' . rand(100, 999),
                'huesped_id'    => $datos['huesped_id'],
                'habitacion_id' => $datos['habitacion_id'],
                'fecha_ingreso' => $datos['fecha_ingreso'],
                'fecha_salida'  => $datos['fecha_salida'],
                'noches'        => $datos['cantidad_noches'],
                'personas'      => $datos['cantidad_personas'],
                'precio_noche'  => $datos['precio_noche'],
                'total'         => $datos['monto_total'],
                'anticipo'      => $datos['monto_anticipo'] ?? 0,
                'estado'        => $datos['estado'] ?? 'Confirmada',
                'solicitudes'   => $datos['solicitudes_especiales'] ?? '',
                'canal'         => $datos['canal_origen'] ?? 'Web Directa'
            ]);

            $reservaId = (int)$this->db->lastInsertId();

            if (($datos['estado'] ?? '') === 'En Estancia') {
                $stmtHab = $this->db->prepare("UPDATE habitaciones SET estado = 'Ocupada' WHERE id = :hab_id");
                $stmtHab->execute(['hab_id' => $datos['habitacion_id']]);
            }

            $this->db->commit();
            return $reservaId;
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    public function actualizarEstado(int $reservaId, string $nuevoEstado): bool {
        $stmt = $this->db->prepare("UPDATE reservas SET estado = :estado, updated_at = NOW() WHERE id = :id");
        return $stmt->execute(['estado' => $nuevoEstado, 'id' => $reservaId]);
    }
}
`,
  },
  {
    path: 'models/HuespedModel.php',
    name: 'HuespedModel.php',
    category: 'Model',
    language: 'php',
    description: 'Modelo de Huéspedes con validación de documentos (CC, Pasaporte, CE), prevención de duplicados y consultas preparadas PDO.',
    content: `<?php
/**
 * Hotel Luna Azul - Modelo de Huéspedes
 * Archivo: models/HuespedModel.php
 * Gestión de base de datos de clientes, historial de visitas y CRM hotelero
 */

namespace Models;

use Config\\Database;
use PDO;

class HuespedModel {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function getAll(string $buscar = ''): array {
        $sql = "SELECT h.*, 
                       (SELECT COUNT(*) FROM reservas r WHERE r.huesped_id = h.id) as total_estancias
                FROM huespedes h";
        
        $params = [];
        if (!empty($buscar)) {
            $sql .= " WHERE h.nombres LIKE :b OR h.apellidos LIKE :b OR h.documento_numero LIKE :b";
            $params['b'] = "%{$buscar}%";
        }

        $sql .= " ORDER BY h.apellidos ASC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public function findByDocument(string $docNum): ?array {
        $stmt = $this->db->prepare("SELECT * FROM huespedes WHERE documento_numero = :doc LIMIT 1");
        $stmt->execute(['doc' => $docNum]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public function create(array $data): int {
        $sql = "INSERT INTO huespedes 
                (codigo, tipo_documento, documento_numero, nombres, apellidos, 
                 email, telefono, nacionalidad, ciudad_origen, notas, created_at)
                VALUES 
                (:codigo, :tipo_doc, :doc_num, :nombres, :apellidos, 
                 :email, :telefono, :nacionalidad, :ciudad, :notas, NOW())";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'codigo'       => 'HUE-' . rand(1000, 9999),
            'tipo_doc'     => $data['tipo_documento'],
            'doc_num'      => $data['documento_numero'],
            'nombres'      => $data['nombres'],
            'apellidos'    => $data['apellidos'],
            'email'        => $data['email'],
            'telefono'     => $data['telefono'],
            'nacionalidad' => $data['nacionalidad'] ?? 'Colombiana',
            'ciudad'       => $data['ciudad_origen'] ?? 'Bogotá D.C.',
            'notas'        => $data['notas'] ?? ''
        ]);

        return (int)$this->db->lastInsertId();
    }
}
`,
  },
  {
    path: 'controllers/ReservaController.php',
    name: 'ReservaController.php',
    category: 'Controller',
    language: 'php',
    description: 'Controlador de Reservas. Orquesta validaciones cliente-servidor, cálculo de noches, comunicación con el Modelo y respuesta AJAX sin recarga.',
    content: `<?php
/**
 * Hotel Luna Azul - Controlador de Reservas
 * Archivo: controllers/ReservaController.php
 * Coordinación de peticiones HTTP, validación y despacho de vistas
 */

namespace Controllers;

use Models\\ReservaModel;
use Models\\HuespedModel;
use Models\\HabitacionModel;
use Exception;

class ReservaController {
    private ReservaModel $reservaModel;
    private HuespedModel $huespedModel;

    public function __construct() {
        $this->reservaModel = new ReservaModel();
        $this->huespedModel = new HuespedModel();
    }

    public function index(): void {
        $filtro = htmlspecialchars($_GET['estado'] ?? '', ENT_QUOTES, 'UTF-8');
        $buscar = htmlspecialchars($_GET['buscar'] ?? '', ENT_QUOTES, 'UTF-8');

        $reservas = $this->reservaModel->getAll($filtro, $buscar);

        require_once __DIR__ . '/../views/reservas/index.php';
    }

    public function guardar(): void {
        header('Content-Type: application/json; charset=utf-8');

        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(['exito' => false, 'mensaje' => 'Método no permitido']);
            return;
        }

        $huespedId = (int)($_POST['huesped_id'] ?? 0);
        $habitacionId = (int)($_POST['habitacion_id'] ?? 0);
        $checkIn = trim($_POST['fecha_ingreso'] ?? '');
        $checkOut = trim($_POST['fecha_salida'] ?? '');
        $precioNoche = (float)($_POST['precio_noche'] ?? 0);

        if (empty($checkIn) || empty($checkOut) || $checkIn >= $checkOut) {
            http_response_code(400);
            echo json_encode([
                'exito' => false, 
                'mensaje' => 'La fecha de check-in debe ser estrictamente anterior a la fecha de check-out.'
            ]);
            return;
        }

        $fecha1 = new \\DateTime($checkIn);
        $fecha2 = new \\DateTime($checkOut);
        $noches = $fecha1->diff($fecha2)->days;

        if ($noches < 1) {
            http_response_code(400);
            echo json_encode(['exito' => false, 'mensaje' => 'La estancia mínima es de 1 noche.']);
            return;
        }

        $montoTotal = $noches * $precioNoche;
        $anticipo = (float)($_POST['monto_anticipo'] ?? ($montoTotal * 0.5));

        try {
            $datosReserva = [
                'huesped_id'            => $huespedId,
                'habitacion_id'         => $habitacionId,
                'fecha_ingreso'         => $checkIn,
                'fecha_salida'          => $checkOut,
                'cantidad_noches'       => $noches,
                'cantidad_personas'     => (int)($_POST['cantidad_personas'] ?? 2),
                'precio_noche'          => $precioNoche,
                'monto_total'           => $montoTotal,
                'monto_anticipo'        => $anticipo,
                'estado'                => 'Confirmada',
                'solicitudes_especiales'=> htmlspecialchars($_POST['solicitudes'] ?? '', ENT_QUOTES, 'UTF-8'),
                'canal_origen'          => 'Web Directa'
            ];

            $nuevoId = $this->reservaModel->crearReserva($datosReserva);

            echo json_encode([
                'exito' => true,
                'mensaje' => '¡Reserva creada exitosamente en Hotel Luna Azul!',
                'reserva_id' => $nuevoId,
                'monto_total' => $montoTotal
            ]);
        } catch (Exception $e) {
            http_response_code(409);
            echo json_encode([
                'exito' => false,
                'mensaje' => $e->getMessage()
            ]);
        }
    }
}
`,
  },
  {
    path: 'views/reservas/index.php',
    name: 'index.php',
    category: 'View',
    language: 'html',
    description: 'Vista HTML5/CSS3 responsiva con maquetación de tarjetas de habitaciones, tabla de reservas y formulario AJAX sin recarga.',
    content: `<!-- Hotel Luna Azul - Vista de Reservas (HTML5 + CSS3 + JavaScript AJAX) -->
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestión de Reservas - Hotel Luna Azul</title>
    <link rel="stylesheet" href="/assets/css/styles.css">
</head>
<body>
    <header class="hotel-navbar">
        <div class="brand">
            <h1>Hotel Luna Azul</h1>
            <span>Boutique Hotel & Resort · PMS Corporativo</span>
        </div>
        <nav class="nav-links">
            <a href="/reservas" class="active">Reservas</a>
            <a href="/huespedes">Huéspedes</a>
            <a href="/habitaciones">Habitaciones</a>
            <a href="/reportes">Reportes</a>
        </nav>
    </header>

    <main class="container">
        <section class="action-bar">
            <h2>Directorio de Reservas Activas</h2>
            <button id="btnNuevaReserva" class="btn btn-primary">+ Nueva Reserva</button>
        </section>

        <form class="filters-form" onsubmit="return false;">
            <input type="text" id="filtroBuscar" placeholder="Buscar por documento o nombre del huésped...">
            <select id="filtroEstado">
                <option value="">Todos los Estados</option>
                <option value="Confirmada">Confirmada</option>
                <option value="En Estancia">En Estancia (Check-In)</option>
                <option value="Completada">Completada (Check-Out)</option>
            </select>
            <button type="button" class="btn btn-secondary" onclick="filtrarReservas()">Filtrar</button>
        </form>

        <div class="table-responsive">
            <table class="table-hotel">
                <thead>
                    <tr>
                        <th>Código</th>
                        <th>Huésped</th>
                        <th>Habitación</th>
                        <th>Check-In</th>
                        <th>Check-Out</th>
                        <th>Noches</th>
                        <th>Total</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody id="tablaCuerpoReservas">
                    <!-- Filas renderizadas dinámicamente vía PHP / AJAX -->
                </tbody>
            </table>
        </div>
    </main>

    <script src="/assets/js/reservas.js"></script>
</body>
</html>
`,
  },
  {
    path: 'database/hotel_luna_azul.sql',
    name: 'hotel_luna_azul.sql',
    category: 'MySQL DDL',
    language: 'sql',
    description: 'Esquema relacional completo de MySQL con tablas de huéspedes, habitaciones, reservas, auditoría e índices anti-sobreventa.',
    content: `-- ========================================================
-- Hotel Luna Azul - Esquema Relacional de Base de Datos MySQL
-- Motor: InnoDB | Codificación: utf8mb4_unicode_ci
-- ========================================================

CREATE DATABASE IF NOT EXISTS hotel_luna_azul 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE hotel_luna_azul;

-- 1. Tabla de Huéspedes
CREATE TABLE IF NOT EXISTS huespedes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    tipo_documento ENUM('CC', 'CE', 'Pasaporte', 'TI', 'DNI') NOT NULL,
    documento_numero VARCHAR(30) UNIQUE NOT NULL,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL,
    telefono VARCHAR(25) NOT NULL,
    nacionalidad VARCHAR(60) DEFAULT 'Colombiana',
    ciudad_origen VARCHAR(80) NOT NULL,
    notas TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_doc_huesped (documento_numero),
    INDEX idx_apellidos_huesped (apellidos)
) ENGINE=InnoDB;

-- 2. Tabla de Habitaciones
CREATE TABLE IF NOT EXISTS habitaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero VARCHAR(10) UNIQUE NOT NULL,
    tipo ENUM('Sencilla', 'Doble', 'Suite Deluxe', 'Familiar') NOT NULL,
    piso TINYINT NOT NULL,
    capacidad_personas TINYINT NOT NULL,
    precio_noche DECIMAL(10,2) NOT NULL,
    estado ENUM('Disponible', 'Ocupada', 'Limpieza', 'Mantenimiento') DEFAULT 'Disponible',
    descripcion TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_estado_hab (estado),
    INDEX idx_tipo_hab (tipo)
) ENGINE=InnoDB;

-- 3. Tabla Principal de Reservas
CREATE TABLE IF NOT EXISTS reservas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(30) UNIQUE NOT NULL,
    huesped_id INT NOT NULL,
    habitacion_id INT NOT NULL,
    fecha_ingreso DATE NOT NULL,
    fecha_salida DATE NOT NULL,
    cantidad_noches INT NOT NULL,
    cantidad_personas INT NOT NULL,
    precio_noche DECIMAL(10,2) NOT NULL,
    monto_total DECIMAL(10,2) NOT NULL,
    monto_anticipo DECIMAL(10,2) DEFAULT 0,
    estado ENUM('Confirmada', 'En Estancia', 'Completada', 'Cancelada') DEFAULT 'Confirmada',
    solicitudes_especiales TEXT NULL,
    canal_origen VARCHAR(50) DEFAULT 'Web Directa',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (huesped_id) REFERENCES huespedes(id) ON DELETE RESTRICT,
    FOREIGN KEY (habitacion_id) REFERENCES habitaciones(id) ON DELETE RESTRICT,
    INDEX idx_rango_fechas (fecha_ingreso, fecha_salida),
    INDEX idx_estado_reserva (estado)
) ENGINE=InnoDB;

-- 4. Tabla de Auditoría y Trazabilidad (Gobernanza)
CREATE TABLE IF NOT EXISTS auditoria_hotel (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario VARCHAR(80) NOT NULL,
    accion ENUM('INSERT', 'UPDATE', 'DELETE', 'CHECK_IN', 'CHECK_OUT', 'CONFIG') NOT NULL,
    tabla_afectada VARCHAR(50) NOT NULL,
    detalles TEXT NOT NULL,
    ip_origen VARCHAR(45) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
`,
  },
  {
    path: 'microservices/hotel_pricing.py',
    name: 'hotel_pricing.py',
    category: 'Python Microservice',
    language: 'python',
    description: 'Microservicio en Python (FastAPI) para Hotel Luna Azul. Calcula demanda proyectada, probabilidad de cancelación y tarifas dinámicas.',
    content: `"""
Hotel Luna Azul - Microservicio de Analítica y Tarifas Dinámicas
Tecnología: Python 3.11 + FastAPI
Propósito: Optimiza tarifas por noche según ocupación estacional y predice riesgo de cancelación
"""

from fastapi import FastAPI
from pydantic import BaseModel, Field
from datetime import datetime, date

app = FastAPI(
    title="Hotel Luna Azul Revenue AI",
    description="Microservicio de Optimización Hotelera y Tarifas Dinámicas",
    version="1.2.0"
)

class PricingRequest(BaseModel):
    habitacion_tipo: str
    precio_base_noche: float
    fecha_ingreso: date
    fecha_salida: date
    ocupacion_actual_porcentaje: float = Field(ge=0, le=100)
    dias_anticipacion_reserva: int = Field(default=7, ge=0)

class PricingResponse(BaseModel):
    habitacion_tipo: str
    precio_recomendado_noche: float
    factor_estacionalidad: float
    probabilidad_cancelacion: float
    clasificacion_demanda: str
    ahorro_o_recargo_porcentaje: float
    timestamp: str

@app.post("/api/pricing/dynamic", response_model=PricingResponse)
def calcular_tarifa_dinamica(req: PricingRequest):
    factor = 1.0
    demanda = "Normal"
    riesgo_cancelacion = 0.12

    if req.ocupacion_actual_porcentaje >= 80:
        factor *= 1.25
        demanda = "Muy Alta (Temporada Alta / Festivo)"
        riesgo_cancelacion = 0.05
    elif req.ocupacion_actual_porcentaje >= 60:
        factor *= 1.10
        demanda = "Media-Alta"
        riesgo_cancelacion = 0.08
    elif req.ocupacion_actual_porcentaje <= 35:
        factor *= 0.90
        demanda = "Baja (Promoción Incentivo)"
        riesgo_cancelacion = 0.18

    if req.dias_anticipacion_reserva > 30:
        riesgo_cancelacion += 0.08

    precio_final = round(req.precio_base_noche * factor, -3)
    diferencia_pct = round(((precio_final - req.precio_base_noche) / req.precio_base_noche) * 100, 1)

    return PricingResponse(
        habitacion_tipo=req.habitacion_tipo,
        precio_recomendado_noche=precio_final,
        factor_estacionalidad=factor,
        probabilidad_cancelacion=round(riesgo_cancelacion, 2),
        clasificacion_demanda=demanda,
        ahorro_o_recargo_porcentaje=diferencia_pct,
        timestamp=datetime.now().isoformat()
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
`,
  },
  {
    path: 'public/index.php',
    name: 'index.php (Front Controller)',
    category: 'Core',
    language: 'php',
    description: 'Front Controller empresarial. Centraliza la entrada, despacha rutas de reservas y huéspedes.',
    content: `<?php
/**
 * Hotel Luna Azul - Front Controller (Single Entry Point)
 * Archivo: public/index.php
 */

declare(strict_types=1);

session_start();

spl_autoload_register(function ($class) {
    $file = __DIR__ . '/../' . str_replace('\\\\', '/', $class) . '.php';
    if (file_exists($file)) {
        require_once $file;
    }
});

use Controllers\\ReservaController;
use Controllers\\HuespedController;

$uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

$reservaCtrl = new ReservaController();

if ($uri === '/' || $uri === '/reservas') {
    $reservaCtrl->index();
} elseif ($uri === '/reservas/guardar' && $method === 'POST') {
    $reservaCtrl->guardar();
} else {
    http_response_code(404);
    echo "<h1>404 - Ruta no encontrada en Hotel Luna Azul</h1>";
}
`,
  },
];

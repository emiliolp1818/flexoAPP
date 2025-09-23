-- Base de datos FlexoApp - Tablas para máquinas y programas de producción
-- Ejecutar con: mysql -u root -p < database/create_flexo_tables.sql

-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS flexoapp_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE flexoapp_db;

-- Tabla de máquinas
CREATE TABLE IF NOT EXISTS maquinas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero INT NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    estado ENUM('activa', 'mantenimiento', 'parada') DEFAULT 'activa',
    eficiencia DECIMAL(5,2) DEFAULT 0.00,
    horas_operacion INT DEFAULT 0,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_numero (numero),
    INDEX idx_estado (estado)
);

-- Tabla de programas de producción (órdenes de trabajo)
CREATE TABLE IF NOT EXISTS programas_produccion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    articulo VARCHAR(50) NOT NULL,
    ot_sap VARCHAR(50) NOT NULL,
    cliente VARCHAR(200) NOT NULL,
    referencia VARCHAR(300) NOT NULL,
    td VARCHAR(10) NOT NULL,
    colores INT NOT NULL DEFAULT 1,
    kilos_sustrato DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    kilos DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    estado ENUM('listo', 'suspendido', 'corriendo', 'terminado') DEFAULT 'listo',
    motivo_suspension TEXT NULL,
    maquina_numero INT NOT NULL,
    sustrato VARCHAR(200) NOT NULL,
    colores_detalle JSON NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    usuario_actualizacion VARCHAR(100) NOT NULL DEFAULT 'system',
    
    INDEX idx_maquina (maquina_numero),
    INDEX idx_estado (estado),
    INDEX idx_articulo (articulo),
    INDEX idx_ot_sap (ot_sap),
    INDEX idx_cliente (cliente),
    INDEX idx_fecha_creacion (fecha_creacion),
    
    FOREIGN KEY (maquina_numero) REFERENCES maquinas(numero) ON UPDATE CASCADE
);

-- Tabla de historial de cambios de estado
CREATE TABLE IF NOT EXISTS historial_estados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    programa_id INT NOT NULL,
    estado_anterior ENUM('listo', 'suspendido', 'corriendo', 'terminado'),
    estado_nuevo ENUM('listo', 'suspendido', 'corriendo', 'terminado') NOT NULL,
    motivo_cambio TEXT,
    usuario VARCHAR(100) NOT NULL,
    fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_programa (programa_id),
    INDEX idx_fecha (fecha_cambio),
    
    FOREIGN KEY (programa_id) REFERENCES programas_produccion(id) ON DELETE CASCADE
);

-- Insertar máquinas iniciales
INSERT INTO maquinas (numero, nombre, estado, eficiencia, horas_operacion) VALUES
(11, 'Máquina #11', 'activa', 94.2, 156),
(12, 'Máquina #12', 'activa', 91.8, 142),
(13, 'Máquina #13', 'mantenimiento', 0.0, 0),
(14, 'Máquina #14', 'activa', 88.5, 178),
(15, 'Máquina #15', 'activa', 92.3, 165),
(16, 'Máquina #16', 'parada', 0.0, 0),
(17, 'Máquina #17', 'activa', 89.7, 134),
(18, 'Máquina #18', 'activa', 93.1, 187),
(19, 'Máquina #19', 'activa', 90.4, 145),
(20, 'Máquina #20', 'mantenimiento', 0.0, 0),
(21, 'Máquina #21', 'activa', 87.9, 198)
ON DUPLICATE KEY UPDATE
    nombre = VALUES(nombre),
    estado = VALUES(estado),
    eficiencia = VALUES(eficiencia),
    horas_operacion = VALUES(horas_operacion);

-- Insertar programas de producción iniciales
INSERT INTO programas_produccion (
    articulo, ot_sap, cliente, referencia, td, colores, kilos_sustrato, kilos, 
    estado, motivo_suspension, maquina_numero, sustrato, colores_detalle, usuario_actualizacion
) VALUES
(
    'F203456', '296571', 'Productos Vicky', 'Kythos Mixtos Natural', 'R', 8, 250.00, 1200.00,
    'listo', NULL, 11, 'BOPP Sell Transp',
    JSON_ARRAY(
        JSON_OBJECT('nombre', 'Amarillo', 'hex', '#FFFF00', 'tipo', 'primario'),
        JSON_OBJECT('nombre', 'Blanco', 'hex', '#FFFFFF', 'tipo', 'primario'),
        JSON_OBJECT('nombre', 'Cyan', 'hex', '#00FFFF', 'tipo', 'primario'),
        JSON_OBJECT('nombre', 'Magenta', 'hex', '#FF00FF', 'tipo', 'primario'),
        JSON_OBJECT('nombre', 'Negro', 'hex', '#000000', 'tipo', 'primario'),
        JSON_OBJECT('nombre', 'Pantone V179', 'hex', '#E6194B', 'tipo', 'pantone'),
        JSON_OBJECT('nombre', 'Pantone C299', 'hex', '#3CB44B', 'tipo', 'pantone'),
        JSON_OBJECT('nombre', 'Crema', 'hex', '#FFFDD0', 'tipo', 'primario')
    ),
    'system'
),
(
    'F203457', '296572', 'Productos Vicky', 'Kythos Premium', 'R', 6, 180.00, 850.00,
    'corriendo', NULL, 12, 'BOPP Sell Transp',
    JSON_ARRAY(
        JSON_OBJECT('nombre', 'Amarillo', 'hex', '#FFFF00', 'tipo', 'primario'),
        JSON_OBJECT('nombre', 'Blanco', 'hex', '#FFFFFF', 'tipo', 'primario'),
        JSON_OBJECT('nombre', 'Cyan', 'hex', '#00FFFF', 'tipo', 'primario'),
        JSON_OBJECT('nombre', 'Magenta', 'hex', '#FF00FF', 'tipo', 'primario'),
        JSON_OBJECT('nombre', 'Negro', 'hex', '#000000', 'tipo', 'primario'),
        JSON_OBJECT('nombre', 'Pantone V179', 'hex', '#E6194B', 'tipo', 'pantone')
    ),
    'system'
),
(
    'F203458', '296573', 'Productos Vicky', 'Kythos Especial', 'R', 4, 320.00, 950.00,
    'suspendido', 'Falta material', 14, 'BOPP Sell Transp',
    JSON_ARRAY(
        JSON_OBJECT('nombre', 'Amarillo', 'hex', '#FFFF00', 'tipo', 'primario'),
        JSON_OBJECT('nombre', 'Blanco', 'hex', '#FFFFFF', 'tipo', 'primario'),
        JSON_OBJECT('nombre', 'Cyan', 'hex', '#00FFFF', 'tipo', 'primario'),
        JSON_OBJECT('nombre', 'Negro', 'hex', '#000000', 'tipo', 'primario')
    ),
    'system'
),
(
    'F203459', '296574', 'Productos Vicky', 'Kythos Deluxe', 'R', 5, 200.00, 750.00,
    'terminado', NULL, 15, 'BOPP Sell Transp',
    JSON_ARRAY(
        JSON_OBJECT('nombre', 'Amarillo', 'hex', '#FFFF00', 'tipo', 'primario'),
        JSON_OBJECT('nombre', 'Blanco', 'hex', '#FFFFFF', 'tipo', 'primario'),
        JSON_OBJECT('nombre', 'Cyan', 'hex', '#00FFFF', 'tipo', 'primario'),
        JSON_OBJECT('nombre', 'Negro', 'hex', '#000000', 'tipo', 'primario'),
        JSON_OBJECT('nombre', 'Pantone C299', 'hex', '#3CB44B', 'tipo', 'pantone')
    ),
    'system'
),
(
    'F203460', '296575', 'Productos Vicky', 'Kythos Classic', 'R', 3, 150.00, 600.00,
    'listo', NULL, 17, 'BOPP Sell Transp',
    JSON_ARRAY(
        JSON_OBJECT('nombre', 'Amarillo', 'hex', '#FFFF00', 'tipo', 'primario'),
        JSON_OBJECT('nombre', 'Negro', 'hex', '#000000', 'tipo', 'primario'),
        JSON_OBJECT('nombre', 'Pantone V179', 'hex', '#E6194B', 'tipo', 'pantone')
    ),
    'system'
)
ON DUPLICATE KEY UPDATE
    cliente = VALUES(cliente),
    referencia = VALUES(referencia),
    estado = VALUES(estado),
    colores_detalle = VALUES(colores_detalle);

-- Crear vista para consultas optimizadas
CREATE OR REPLACE VIEW vista_programas_maquinas AS
SELECT 
    p.id,
    p.articulo,
    p.ot_sap,
    p.cliente,
    p.referencia,
    p.td,
    p.colores,
    p.kilos_sustrato,
    p.kilos,
    p.estado,
    p.motivo_suspension,
    p.sustrato,
    p.colores_detalle,
    p.fecha_creacion,
    p.fecha_actualizacion,
    p.usuario_actualizacion,
    m.numero as maquina_numero,
    m.nombre as maquina_nombre,
    m.estado as maquina_estado,
    m.eficiencia as maquina_eficiencia
FROM programas_produccion p
INNER JOIN maquinas m ON p.maquina_numero = m.numero
ORDER BY p.fecha_actualizacion DESC;

-- Crear procedimientos almacenados para operaciones comunes

-- Procedimiento para cambiar estado de programa
DELIMITER //
CREATE PROCEDURE CambiarEstadoPrograma(
    IN p_programa_id INT,
    IN p_nuevo_estado ENUM('listo', 'suspendido', 'corriendo', 'terminado'),
    IN p_motivo TEXT,
    IN p_usuario VARCHAR(100)
)
BEGIN
    DECLARE v_estado_anterior ENUM('listo', 'suspendido', 'corriendo', 'terminado');
    
    -- Obtener estado anterior
    SELECT estado INTO v_estado_anterior 
    FROM programas_produccion 
    WHERE id = p_programa_id;
    
    -- Actualizar programa
    UPDATE programas_produccion 
    SET estado = p_nuevo_estado,
        motivo_suspension = CASE WHEN p_nuevo_estado = 'suspendido' THEN p_motivo ELSE NULL END,
        usuario_actualizacion = p_usuario,
        fecha_actualizacion = CURRENT_TIMESTAMP
    WHERE id = p_programa_id;
    
    -- Registrar en historial
    INSERT INTO historial_estados (programa_id, estado_anterior, estado_nuevo, motivo_cambio, usuario)
    VALUES (p_programa_id, v_estado_anterior, p_nuevo_estado, p_motivo, p_usuario);
END //

-- Procedimiento para obtener programas por máquina
CREATE PROCEDURE ObtenerProgramasPorMaquina(
    IN p_maquina_numero INT
)
BEGIN
    SELECT * FROM vista_programas_maquinas 
    WHERE maquina_numero = p_maquina_numero
    ORDER BY fecha_actualizacion DESC;
END //

-- Procedimiento para crear programa
CREATE PROCEDURE CrearPrograma(
    IN p_articulo VARCHAR(50),
    IN p_ot_sap VARCHAR(50),
    IN p_cliente VARCHAR(200),
    IN p_referencia VARCHAR(300),
    IN p_td VARCHAR(10),
    IN p_colores INT,
    IN p_kilos_sustrato DECIMAL(10,2),
    IN p_kilos DECIMAL(10,2),
    IN p_estado ENUM('listo', 'suspendido', 'corriendo', 'terminado'),
    IN p_maquina_numero INT,
    IN p_sustrato VARCHAR(200),
    IN p_colores_detalle JSON,
    IN p_usuario VARCHAR(100)
)
BEGIN
    INSERT INTO programas_produccion (
        articulo, ot_sap, cliente, referencia, td, colores, kilos_sustrato, kilos,
        estado, maquina_numero, sustrato, colores_detalle, usuario_actualizacion
    ) VALUES (
        p_articulo, p_ot_sap, p_cliente, p_referencia, p_td, p_colores, p_kilos_sustrato, p_kilos,
        p_estado, p_maquina_numero, p_sustrato, p_colores_detalle, p_usuario
    );
    
    SELECT LAST_INSERT_ID() as nuevo_id;
END //

DELIMITER ;

-- Crear índices adicionales para optimización
CREATE INDEX idx_programas_fecha_estado ON programas_produccion(fecha_actualizacion, estado);
CREATE INDEX idx_historial_programa_fecha ON historial_estados(programa_id, fecha_cambio);

-- Mostrar resumen de la base de datos creada
SELECT 'Base de datos FlexoApp creada exitosamente' as mensaje;
SELECT COUNT(*) as total_maquinas FROM maquinas;
SELECT COUNT(*) as total_programas FROM programas_produccion;
SELECT estado, COUNT(*) as cantidad FROM programas_produccion GROUP BY estado;
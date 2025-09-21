-- Crear base de datos flexoBD2
CREATE DATABASE IF NOT EXISTS flexoBD2 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE flexoBD2;

-- Eliminar tabla si existe para recrearla con la nueva estructura
DROP TABLE IF EXISTS flexoBD_usuarios;

-- Crear tabla flexoBD_usuarios con la estructura correcta
CREATE TABLE flexoBD_usuarios (
    codigo_usuario VARCHAR(50) PRIMARY KEY NOT NULL,
    contrasena VARCHAR(255) NOT NULL COMMENT 'Contraseña encriptada con BCrypt',
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    rol VARCHAR(50) NOT NULL DEFAULT 'usuario',
    foto LONGBLOB NULL COMMENT 'Foto del usuario en formato binario',
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultimo_acceso TIMESTAMP NULL,
    INDEX idx_activo (activo),
    INDEX idx_rol (rol),
    INDEX idx_fecha_creacion (fecha_creacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Crear usuario administrador por defecto con contraseña encriptada
-- Contraseña: admin123 (encriptada con BCrypt)
INSERT INTO flexoBD_usuarios (
    codigo_usuario, 
    contrasena, 
    nombre, 
    apellido, 
    rol, 
    activo
) VALUES (
    'admin',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO.2',
    'Administrador',
    'Sistema',
    'admin',
    TRUE
) ON DUPLICATE KEY UPDATE 
    contrasena = VALUES(contrasena),
    nombre = VALUES(nombre),
    apellido = VALUES(apellido),
    rol = VALUES(rol);

-- Verificar que la tabla se creó correctamente
SELECT 'Tabla flexoBD_usuarios creada exitosamente' as mensaje;
DESCRIBE flexoBD_usuarios;

-- Mostrar usuario creado
SELECT codigo_usuario, nombre, apellido, rol, activo, fecha_creacion 
FROM flexoBD_usuarios 
WHERE codigo_usuario = 'admin';
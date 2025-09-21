-- Crear base de datos flexoBD2
DROP DATABASE IF EXISTS flexoBD2;
CREATE DATABASE flexoBD2 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE flexoBD2;

-- Crear tabla usuarios
CREATE TABLE usuarios (
    codigo_usuario VARCHAR(50) PRIMARY KEY NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    rol VARCHAR(50) NOT NULL DEFAULT 'usuario',
    foto LONGBLOB NULL,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultimo_acceso TIMESTAMP NULL
);

-- Insertar usuario admin
INSERT INTO usuarios (codigo_usuario, contrasena, nombre, apellido, rol) 
VALUES ('admin', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO.2', 'Administrador', 'Sistema', 'admin');

-- Verificar
SELECT 'Base de datos creada exitosamente' as mensaje;
SELECT * FROM usuarios;
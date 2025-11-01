-- Script para inicializar la base de datos flexoBD con usuario de prueba

-- Crear la base de datos si no existe
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'flexoBD')
BEGIN
    CREATE DATABASE flexoBD;
END
GO

USE flexoBD;
GO

-- Crear la tabla usuario si no existe
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'usuario')
BEGIN
    CREATE TABLE usuario (
        CodigoUsuario nvarchar(20) PRIMARY KEY,
        Nombre nvarchar(20) NOT NULL,
        Apellidos nvarchar(20) NOT NULL,
        Correo nvarchar(50) NULL,
        Rol nvarchar(20) NOT NULL,
        Telefono nvarchar(15) NULL,
        Contrasena nvarchar(255) NOT NULL,
        Permisos nvarchar(50) NOT NULL,
        ImagenPerfil nvarchar(255) NULL,
        Activo bit NOT NULL DEFAULT 1,
        FechaCreacion datetime2 NOT NULL DEFAULT GETUTCDATE(),
        FechaUpdate datetime2 NOT NULL DEFAULT GETUTCDATE()
    );
END
GO

-- Insertar usuario de prueba (admin/admin123)
-- Password hash para 'admin123' usando BCrypt
IF NOT EXISTS (SELECT * FROM usuario WHERE CodigoUsuario = 'admin')
BEGIN
    INSERT INTO usuario (CodigoUsuario, Nombre, Apellidos, Correo, Rol, Telefono, Contrasena, Permisos, Activo)
    VALUES ('admin', 'Administrador', 'Sistema', 'admin@flexospring.com', 'Administrador', '1234567890', '$2a$11$ZppqqbQoijXY3JyW5W5j5.ZgC/poFmaEbcQsUSaLS/rCHmO96Yaba', 'FULL_ACCESS', 1);
END
GO

-- Insertar usuario de prueba adicional (operador/operador123)
IF NOT EXISTS (SELECT * FROM usuario WHERE CodigoUsuario = 'operador')
BEGIN
    INSERT INTO usuario (CodigoUsuario, Nombre, Apellidos, Correo, Rol, Contrasena, Permisos, Activo)
    VALUES ('operador', 'Juan', 'Pérez', 'operador@flexospring.com', 'Operador', '$2a$11$ZppqqbQoijXY3JyW5W5j5.ZgC/poFmaEbcQsUSaLS/rCHmO96Yaba', 'READ_WRITE', 1);
END
GO

-- Verificar que los usuarios fueron creados
SELECT CodigoUsuario, Nombre, Apellidos, Correo, Rol, Permisos, Activo, FechaCreacion FROM usuario;
GO
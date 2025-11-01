-- Script para migrar la tabla usuario existente a la nueva estructura
-- EJECUTAR SOLO SI YA EXISTE UNA TABLA usuario CON LA ESTRUCTURA ANTERIOR

USE flexoBD;
GO

-- Verificar si existe la tabla con la estructura anterior
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('usuario') AND name = 'Id')
BEGIN
    PRINT 'Migrando tabla usuario a nueva estructura...'
    
    -- Crear tabla temporal con nueva estructura
    CREATE TABLE usuario_new (
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
    
    -- Migrar datos existentes (ajustar según los campos disponibles)
    INSERT INTO usuario_new (CodigoUsuario, Nombre, Apellidos, Correo, Rol, Contrasena, Permisos, Activo, FechaCreacion)
    SELECT 
        Username as CodigoUsuario,
        'Usuario' as Nombre,
        'Sistema' as Apellidos,
        Email as Correo,
        'Usuario' as Rol,
        Password as Contrasena,
        'READ_WRITE' as Permisos,
        IsActive as Activo,
        CreatedAt as FechaCreacion
    FROM usuario;
    
    -- Respaldar tabla anterior
    EXEC sp_rename 'usuario', 'usuario_backup';
    
    -- Renombrar nueva tabla
    EXEC sp_rename 'usuario_new', 'usuario';
    
    PRINT 'Migración completada. Tabla anterior respaldada como usuario_backup'
END
ELSE
BEGIN
    PRINT 'La tabla usuario ya tiene la nueva estructura o no existe'
END
GO
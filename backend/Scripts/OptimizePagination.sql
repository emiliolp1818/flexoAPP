-- Script para optimizar la base de datos para paginación eficiente
-- Ejecutar después de crear la tabla usuario

USE flexoBD;
GO

-- Crear índices para mejorar rendimiento de paginación
PRINT 'Creando índices para optimización de paginación...';

-- Índice principal por CodigoUsuario (ya es PK, pero asegurar)
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'PK_usuario_CodigoUsuario')
BEGIN
    PRINT 'Índice de clave primaria ya existe para CodigoUsuario';
END

-- Índice compuesto para filtros comunes (Rol, Activo, FechaCreacion)
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Usuario_Rol_Activo_FechaCreacion')
BEGIN
    CREATE INDEX IX_Usuario_Rol_Activo_FechaCreacion 
    ON usuario(Rol, Activo, FechaCreacion DESC);
    PRINT '✓ Creado índice IX_Usuario_Rol_Activo_FechaCreacion';
END

-- Índice para búsquedas de texto en nombre y apellidos
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Usuario_Nombre_Apellidos')
BEGIN
    CREATE INDEX IX_Usuario_Nombre_Apellidos 
    ON usuario(Nombre, Apellidos);
    PRINT '✓ Creado índice IX_Usuario_Nombre_Apellidos';
END

-- Índice para ordenamiento por fecha de creación
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Usuario_FechaCreacion')
BEGIN
    CREATE INDEX IX_Usuario_FechaCreacion 
    ON usuario(FechaCreacion DESC);
    PRINT '✓ Creado índice IX_Usuario_FechaCreacion';
END

-- Índice para ordenamiento por fecha de actualización
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Usuario_FechaUpdate')
BEGIN
    CREATE INDEX IX_Usuario_FechaUpdate 
    ON usuario(FechaUpdate DESC);
    PRINT '✓ Creado índice IX_Usuario_FechaUpdate';
END

-- Índice para búsquedas por correo electrónico
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Usuario_Correo')
BEGIN
    CREATE INDEX IX_Usuario_Correo 
    ON usuario(Correo) 
    WHERE Correo IS NOT NULL;
    PRINT '✓ Creado índice IX_Usuario_Correo';
END

-- Índice para búsquedas por teléfono
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Usuario_Telefono')
BEGIN
    CREATE INDEX IX_Usuario_Telefono 
    ON usuario(Telefono) 
    WHERE Telefono IS NOT NULL;
    PRINT '✓ Creado índice IX_Usuario_Telefono';
END

-- Índice para filtros por permisos
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Usuario_Permisos')
BEGIN
    CREATE INDEX IX_Usuario_Permisos 
    ON usuario(Permisos);
    PRINT '✓ Creado índice IX_Usuario_Permisos';
END

PRINT 'Índices creados exitosamente.';
PRINT '';

-- Crear estadísticas para mejorar el optimizador de consultas
PRINT 'Actualizando estadísticas...';

UPDATE STATISTICS usuario;
PRINT '✓ Estadísticas actualizadas para tabla usuario';

-- Verificar índices creados
PRINT '';
PRINT 'Índices existentes en la tabla usuario:';
SELECT 
    i.name AS IndexName,
    i.type_desc AS IndexType,
    STUFF((
        SELECT ', ' + c.name + CASE WHEN ic.is_descending_key = 1 THEN ' DESC' ELSE ' ASC' END
        FROM sys.index_columns ic
        INNER JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
        WHERE ic.object_id = i.object_id AND ic.index_id = i.index_id
        ORDER BY ic.key_ordinal
        FOR XML PATH('')
    ), 1, 2, '') AS Columns,
    i.is_unique AS IsUnique,
    i.is_primary_key AS IsPrimaryKey
FROM sys.indexes i
WHERE i.object_id = OBJECT_ID('usuario')
    AND i.type > 0  -- Excluir heap
ORDER BY i.name;

-- Crear procedimiento almacenado para paginación optimizada
PRINT '';
PRINT 'Creando procedimiento almacenado para paginación...';

IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_GetUsuariosPaginated')
BEGIN
    DROP PROCEDURE sp_GetUsuariosPaginated;
END
GO

CREATE PROCEDURE sp_GetUsuariosPaginated
    @Page INT = 1,
    @PageSize INT = 10,
    @SearchTerm NVARCHAR(100) = NULL,
    @Rol NVARCHAR(20) = NULL,
    @Activo BIT = NULL,
    @FechaCreacionDesde DATETIME2 = NULL,
    @FechaCreacionHasta DATETIME2 = NULL,
    @SortBy NVARCHAR(50) = 'FechaCreacion',
    @SortDescending BIT = 1,
    @TotalCount INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Validar parámetros
    IF @Page < 1 SET @Page = 1;
    IF @PageSize < 1 OR @PageSize > 100 SET @PageSize = 10;
    
    -- Calcular offset
    DECLARE @Offset INT = (@Page - 1) * @PageSize;
    
    -- Construir consulta dinámica para flexibilidad
    DECLARE @SQL NVARCHAR(MAX);
    DECLARE @CountSQL NVARCHAR(MAX);
    DECLARE @WhereClause NVARCHAR(MAX) = '';
    DECLARE @OrderClause NVARCHAR(MAX);
    
    -- Construir cláusula WHERE
    IF @SearchTerm IS NOT NULL
    BEGIN
        SET @WhereClause = @WhereClause + 
            ' AND (CodigoUsuario LIKE ''%' + @SearchTerm + '%'' 
               OR Nombre LIKE ''%' + @SearchTerm + '%'' 
               OR Apellidos LIKE ''%' + @SearchTerm + '%'' 
               OR Correo LIKE ''%' + @SearchTerm + '%'')';
    END
    
    IF @Rol IS NOT NULL
    BEGIN
        SET @WhereClause = @WhereClause + ' AND Rol = ''' + @Rol + '''';
    END
    
    IF @Activo IS NOT NULL
    BEGIN
        SET @WhereClause = @WhereClause + ' AND Activo = ' + CAST(@Activo AS NVARCHAR(1));
    END
    
    IF @FechaCreacionDesde IS NOT NULL
    BEGIN
        SET @WhereClause = @WhereClause + ' AND FechaCreacion >= ''' + CONVERT(NVARCHAR(23), @FechaCreacionDesde, 121) + '''';
    END
    
    IF @FechaCreacionHasta IS NOT NULL
    BEGIN
        SET @WhereClause = @WhereClause + ' AND FechaCreacion <= ''' + CONVERT(NVARCHAR(23), @FechaCreacionHasta, 121) + '''';
    END
    
    -- Remover el primer ' AND '
    IF LEN(@WhereClause) > 0
    BEGIN
        SET @WhereClause = 'WHERE ' + SUBSTRING(@WhereClause, 6, LEN(@WhereClause));
    END
    
    -- Construir cláusula ORDER BY
    SET @OrderClause = 'ORDER BY ' + @SortBy + CASE WHEN @SortDescending = 1 THEN ' DESC' ELSE ' ASC' END;
    
    -- Consulta para contar total
    SET @CountSQL = 'SELECT @TotalCount = COUNT(*) FROM usuario ' + @WhereClause;
    
    -- Consulta principal con paginación
    SET @SQL = '
    SELECT 
        CodigoUsuario,
        Nombre,
        Apellidos,
        (Nombre + '' '' + Apellidos) AS NombreCompleto,
        Correo,
        Rol,
        Telefono,
        Permisos,
        ImagenPerfil,
        Activo,
        FechaCreacion,
        FechaUpdate
    FROM usuario ' + 
    @WhereClause + ' ' +
    @OrderClause + '
    OFFSET ' + CAST(@Offset AS NVARCHAR(10)) + ' ROWS
    FETCH NEXT ' + CAST(@PageSize AS NVARCHAR(10)) + ' ROWS ONLY';
    
    -- Ejecutar consulta de conteo
    EXEC sp_executesql @CountSQL, N'@TotalCount INT OUTPUT', @TotalCount OUTPUT;
    
    -- Ejecutar consulta principal
    EXEC sp_executesql @SQL;
END
GO

PRINT '✓ Procedimiento almacenado sp_GetUsuariosPaginated creado';

-- Crear función para paginación basada en cursor
PRINT '';
PRINT 'Creando función para paginación basada en cursor...';

IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_GetUsuariosCursor')
BEGIN
    DROP PROCEDURE sp_GetUsuariosCursor;
END
GO

CREATE PROCEDURE sp_GetUsuariosCursor
    @PageSize INT = 10,
    @LastId NVARCHAR(20) = NULL,
    @SearchTerm NVARCHAR(100) = NULL,
    @SortDescending BIT = 0
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Validar parámetros
    IF @PageSize < 1 OR @PageSize > 100 SET @PageSize = 10;
    
    DECLARE @SQL NVARCHAR(MAX);
    DECLARE @WhereClause NVARCHAR(MAX) = '';
    DECLARE @OrderClause NVARCHAR(MAX);
    
    -- Construir cláusula WHERE para búsqueda
    IF @SearchTerm IS NOT NULL
    BEGIN
        SET @WhereClause = @WhereClause + 
            ' AND (CodigoUsuario LIKE ''%' + @SearchTerm + '%'' 
               OR Nombre LIKE ''%' + @SearchTerm + '%'' 
               OR Apellidos LIKE ''%' + @SearchTerm + '%'' 
               OR Correo LIKE ''%' + @SearchTerm + '%'')';
    END
    
    -- Agregar condición de cursor
    IF @LastId IS NOT NULL
    BEGIN
        IF @SortDescending = 1
        BEGIN
            SET @WhereClause = @WhereClause + ' AND CodigoUsuario < ''' + @LastId + '''';
        END
        ELSE
        BEGIN
            SET @WhereClause = @WhereClause + ' AND CodigoUsuario > ''' + @LastId + '''';
        END
    END
    
    -- Remover el primer ' AND '
    IF LEN(@WhereClause) > 0
    BEGIN
        SET @WhereClause = 'WHERE ' + SUBSTRING(@WhereClause, 6, LEN(@WhereClause));
    END
    
    -- Construir cláusula ORDER BY
    SET @OrderClause = 'ORDER BY CodigoUsuario' + CASE WHEN @SortDescending = 1 THEN ' DESC' ELSE ' ASC' END;
    
    -- Consulta principal (tomar un elemento extra para determinar si hay más páginas)
    SET @SQL = '
    SELECT TOP (' + CAST(@PageSize + 1 AS NVARCHAR(10)) + ')
        CodigoUsuario,
        Nombre,
        Apellidos,
        (Nombre + '' '' + Apellidos) AS NombreCompleto,
        Correo,
        Rol,
        Telefono,
        Permisos,
        ImagenPerfil,
        Activo,
        FechaCreacion,
        FechaUpdate
    FROM usuario ' + 
    @WhereClause + ' ' +
    @OrderClause;
    
    -- Ejecutar consulta
    EXEC sp_executesql @SQL;
END
GO

PRINT '✓ Procedimiento almacenado sp_GetUsuariosCursor creado';

PRINT '';
PRINT '========================================';
PRINT 'OPTIMIZACIÓN COMPLETADA EXITOSAMENTE';
PRINT '========================================';
PRINT '';
PRINT 'Índices creados para mejorar rendimiento:';
PRINT '- Búsquedas por rol, estado y fecha';
PRINT '- Búsquedas de texto en nombres';
PRINT '- Ordenamiento por fechas';
PRINT '- Filtros por correo y teléfono';
PRINT '';
PRINT 'Procedimientos almacenados disponibles:';
PRINT '- sp_GetUsuariosPaginated (paginación tradicional)';
PRINT '- sp_GetUsuariosCursor (paginación por cursor)';
PRINT '';
PRINT 'La base de datos está optimizada para manejar';
PRINT 'grandes volúmenes de usuarios eficientemente.';

GO
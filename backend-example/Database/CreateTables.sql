-- Crear base de datos FlexoApp
CREATE DATABASE FlexoApp;
GO

USE FlexoApp;
GO

-- Tabla de Máquinas
CREATE TABLE Machines (
    Numero INT PRIMARY KEY,
    Nombre NVARCHAR(50) NOT NULL,
    Estado NVARCHAR(20) NOT NULL DEFAULT 'activa',
    Eficiencia DECIMAL(5,2) NOT NULL DEFAULT 0,
    HorasOperacion INT NOT NULL DEFAULT 0,
    FechaActualizacion DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    CONSTRAINT CK_Machine_Estado CHECK (Estado IN ('activa', 'mantenimiento', 'parada')),
    CONSTRAINT CK_Machine_Eficiencia CHECK (Eficiencia >= 0 AND Eficiencia <= 100)
);

-- Tabla de Órdenes de Trabajo / Programas de Producción
CREATE TABLE WorkOrders (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Articulo NVARCHAR(50) NOT NULL,
    OtSap NVARCHAR(50) NOT NULL,
    Cliente NVARCHAR(100) NOT NULL,
    Referencia NVARCHAR(200) NOT NULL,
    Td NVARCHAR(10) NOT NULL,
    Colores INT NOT NULL,
    KilosSustrato INT NOT NULL,
    Kilos INT NOT NULL,
    Estado NVARCHAR(20) NOT NULL DEFAULT 'listo',
    MotivoSuspension NVARCHAR(500) NULL,
    Maquina INT NOT NULL,
    Sustrato NVARCHAR(100) NOT NULL,
    ColoresDetalle NVARCHAR(MAX) NOT NULL, -- JSON string
    FechaCreacion DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    FechaActualizacion DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UsuarioActualizacion NVARCHAR(100) NOT NULL DEFAULT 'system',
    
    CONSTRAINT FK_WorkOrders_Machines FOREIGN KEY (Maquina) REFERENCES Machines(Numero),
    CONSTRAINT CK_WorkOrder_Estado CHECK (Estado IN ('listo', 'suspendido', 'corriendo', 'terminado')),
    CONSTRAINT CK_WorkOrder_Colores CHECK (Colores > 0),
    CONSTRAINT CK_WorkOrder_Kilos CHECK (Kilos > 0 AND KilosSustrato > 0)
);

-- Insertar datos iniciales de máquinas
INSERT INTO Machines (Numero, Nombre, Estado, Eficiencia, HorasOperacion) VALUES
(11, 'Máquina #11', 'activa', 94.2, 156),
(12, 'Máquina #12', 'activa', 91.8, 142),
(13, 'Máquina #13', 'mantenimiento', 0, 0),
(14, 'Máquina #14', 'activa', 88.5, 178),
(15, 'Máquina #15', 'activa', 92.3, 165),
(16, 'Máquina #16', 'parada', 0, 0),
(17, 'Máquina #17', 'activa', 89.7, 134),
(18, 'Máquina #18', 'activa', 93.1, 187),
(19, 'Máquina #19', 'activa', 90.4, 145),
(20, 'Máquina #20', 'mantenimiento', 0, 0),
(21, 'Máquina #21', 'activa', 87.9, 198);

-- Crear índices para mejorar rendimiento
CREATE INDEX IX_WorkOrders_Maquina ON WorkOrders(Maquina);
CREATE INDEX IX_WorkOrders_Estado ON WorkOrders(Estado);
CREATE INDEX IX_WorkOrders_FechaCreacion ON WorkOrders(FechaCreacion);
CREATE INDEX IX_WorkOrders_FechaActualizacion ON WorkOrders(FechaActualizacion);

-- Crear trigger para actualizar FechaActualizacion automáticamente
CREATE TRIGGER TR_WorkOrders_UpdateTimestamp
ON WorkOrders
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE WorkOrders 
    SET FechaActualizacion = GETUTCDATE()
    FROM WorkOrders w
    INNER JOIN inserted i ON w.Id = i.Id;
END;
GO

-- Crear trigger para actualizar FechaActualizacion en Machines
CREATE TRIGGER TR_Machines_UpdateTimestamp
ON Machines
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE Machines 
    SET FechaActualizacion = GETUTCDATE()
    FROM Machines m
    INNER JOIN inserted i ON m.Numero = i.Numero;
END;
GO

-- Crear vista para consultas frecuentes
CREATE VIEW VW_WorkOrdersWithMachine AS
SELECT 
    wo.Id,
    wo.Articulo,
    wo.OtSap,
    wo.Cliente,
    wo.Referencia,
    wo.Td,
    wo.Colores,
    wo.KilosSustrato,
    wo.Kilos,
    wo.Estado,
    wo.MotivoSuspension,
    wo.Maquina,
    m.Nombre as NombreMaquina,
    m.Estado as EstadoMaquina,
    wo.Sustrato,
    wo.ColoresDetalle,
    wo.FechaCreacion,
    wo.FechaActualizacion,
    wo.UsuarioActualizacion
FROM WorkOrders wo
INNER JOIN Machines m ON wo.Maquina = m.Numero;
GO

PRINT 'Base de datos FlexoApp creada exitosamente con todas las tablas, índices y triggers.';
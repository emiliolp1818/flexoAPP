const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:4200',
  credentials: true
}));
app.use(express.json());

// Configuración de la base de datos
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'flexoapp_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Pool de conexiones
const pool = mysql.createPool(dbConfig);

// Función para probar la conexión
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conexión a MySQL establecida correctamente');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Error conectando a MySQL:', error.message);
    return false;
  }
}

// Rutas para máquinas
app.get('/api/machines', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT numero, nombre, estado, eficiencia, horas_operacion, fecha_actualizacion FROM maquinas ORDER BY numero'
    );
    
    console.log('GET /api/machines - Enviando', rows.length, 'máquinas');
    res.json(rows);
  } catch (error) {
    console.error('Error obteniendo máquinas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/machines/:numero', async (req, res) => {
  try {
    const numero = parseInt(req.params.numero);
    const [rows] = await pool.execute(
      'SELECT * FROM maquinas WHERE numero = ?',
      [numero]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Máquina no encontrada' });
    }
    
    console.log('GET /api/machines/' + numero);
    res.json(rows[0]);
  } catch (error) {
    console.error('Error obteniendo máquina:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Rutas para órdenes de trabajo
app.get('/api/workorders', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        id, articulo, ot_sap, cliente, referencia, td, colores, 
        kilos_sustrato, kilos, estado, motivo_suspension, maquina_numero as maquina,
        sustrato, colores_detalle, fecha_creacion, fecha_actualizacion, usuario_actualizacion
      FROM programas_produccion 
      ORDER BY fecha_actualizacion DESC
    `);
    
    // Parsear JSON de colores_detalle
    const ordersWithParsedColors = rows.map(order => ({
      ...order,
      coloresDetalle: typeof order.colores_detalle === 'string' 
        ? JSON.parse(order.colores_detalle) 
        : order.colores_detalle
    }));
    
    console.log('GET /api/workorders - Enviando', rows.length, 'programas');
    res.json(ordersWithParsedColors);
  } catch (error) {
    console.error('Error obteniendo programas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/workorders/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [rows] = await pool.execute(`
      SELECT 
        id, articulo, ot_sap, cliente, referencia, td, colores, 
        kilos_sustrato, kilos, estado, motivo_suspension, maquina_numero as maquina,
        sustrato, colores_detalle, fecha_creacion, fecha_actualizacion, usuario_actualizacion
      FROM programas_produccion 
      WHERE id = ?
    `, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Programa no encontrado' });
    }
    
    const order = {
      ...rows[0],
      coloresDetalle: typeof rows[0].colores_detalle === 'string' 
        ? JSON.parse(rows[0].colores_detalle) 
        : rows[0].colores_detalle
    };
    
    console.log('GET /api/workorders/' + id);
    res.json(order);
  } catch (error) {
    console.error('Error obteniendo programa:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/workorders/machine/:machineNumber', async (req, res) => {
  try {
    const machineNumber = parseInt(req.params.machineNumber);
    const [rows] = await pool.execute(`
      SELECT 
        id, articulo, ot_sap, cliente, referencia, td, colores, 
        kilos_sustrato, kilos, estado, motivo_suspension, maquina_numero as maquina,
        sustrato, colores_detalle, fecha_creacion, fecha_actualizacion, usuario_actualizacion
      FROM programas_produccion 
      WHERE maquina_numero = ?
      ORDER BY fecha_actualizacion DESC
    `, [machineNumber]);
    
    const ordersWithParsedColors = rows.map(order => ({
      ...order,
      coloresDetalle: typeof order.colores_detalle === 'string' 
        ? JSON.parse(order.colores_detalle) 
        : order.colores_detalle
    }));
    
    console.log('GET /api/workorders/machine/' + machineNumber + ' - Enviando', rows.length, 'programas');
    res.json(ordersWithParsedColors);
  } catch (error) {
    console.error('Error obteniendo programas por máquina:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/api/workorders', async (req, res) => {
  try {
    const {
      articulo, otSap, cliente, referencia, td, colores, kilosSustrato, kilos,
      estado, maquina, sustrato, coloresDetalle, usuarioActualizacion
    } = req.body;
    
    const coloresJson = typeof coloresDetalle === 'string' 
      ? coloresDetalle 
      : JSON.stringify(coloresDetalle);
    
    const [result] = await pool.execute(`
      INSERT INTO programas_produccion (
        articulo, ot_sap, cliente, referencia, td, colores, kilos_sustrato, kilos,
        estado, maquina_numero, sustrato, colores_detalle, usuario_actualizacion
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      articulo, otSap, cliente, referencia, td, colores, kilosSustrato, kilos,
      estado, maquina, sustrato, coloresJson, usuarioActualizacion
    ]);
    
    // Obtener el programa creado
    const [newOrder] = await pool.execute(`
      SELECT 
        id, articulo, ot_sap, cliente, referencia, td, colores, 
        kilos_sustrato, kilos, estado, motivo_suspension, maquina_numero as maquina,
        sustrato, colores_detalle, fecha_creacion, fecha_actualizacion, usuario_actualizacion
      FROM programas_produccion 
      WHERE id = ?
    `, [result.insertId]);
    
    const responseOrder = {
      ...newOrder[0],
      coloresDetalle: JSON.parse(newOrder[0].colores_detalle)
    };
    
    console.log('POST /api/workorders - Programa creado con ID:', result.insertId);
    res.status(201).json(responseOrder);
  } catch (error) {
    console.error('Error creando programa:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.put('/api/workorders/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { estado, motivoSuspension, usuarioActualizacion } = req.body;
    
    // Usar procedimiento almacenado para cambiar estado
    await pool.execute(
      'CALL CambiarEstadoPrograma(?, ?, ?, ?)',
      [id, estado, motivoSuspension, usuarioActualizacion]
    );
    
    // Obtener el programa actualizado
    const [rows] = await pool.execute(`
      SELECT 
        id, articulo, ot_sap, cliente, referencia, td, colores, 
        kilos_sustrato, kilos, estado, motivo_suspension, maquina_numero as maquina,
        sustrato, colores_detalle, fecha_creacion, fecha_actualizacion, usuario_actualizacion
      FROM programas_produccion 
      WHERE id = ?
    `, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Programa no encontrado' });
    }
    
    const responseOrder = {
      ...rows[0],
      coloresDetalle: JSON.parse(rows[0].colores_detalle)
    };
    
    console.log('PUT /api/workorders/' + id + ' - Estado actualizado a:', estado);
    res.json(responseOrder);
  } catch (error) {
    console.error('Error actualizando programa:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.delete('/api/workorders/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    const [result] = await pool.execute(
      'DELETE FROM programas_produccion WHERE id = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Programa no encontrado' });
    }
    
    console.log('DELETE /api/workorders/' + id + ' - Programa eliminado');
    res.status(204).send();
  } catch (error) {
    console.error('Error eliminando programa:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta de prueba
app.get('/api/test', async (req, res) => {
  try {
    const [machines] = await pool.execute('SELECT COUNT(*) as count FROM maquinas');
    const [workOrders] = await pool.execute('SELECT COUNT(*) as count FROM programas_produccion');
    
    res.json({ 
      message: 'Backend MySQL funcionando correctamente!', 
      timestamp: new Date(),
      database: 'MySQL',
      machines: machines[0].count,
      workOrders: workOrders[0].count
    });
  } catch (error) {
    res.json({ 
      message: 'Backend funcionando pero sin conexión a MySQL', 
      timestamp: new Date(),
      error: error.message
    });
  }
});

// Ruta para estadísticas
app.get('/api/stats', async (req, res) => {
  try {
    const [estadoStats] = await pool.execute(`
      SELECT estado, COUNT(*) as cantidad 
      FROM programas_produccion 
      GROUP BY estado
    `);
    
    const [maquinaStats] = await pool.execute(`
      SELECT 
        m.numero,
        m.nombre,
        m.estado as maquina_estado,
        COUNT(p.id) as programas_asignados,
        SUM(CASE WHEN p.estado = 'corriendo' THEN 1 ELSE 0 END) as programas_corriendo
      FROM maquinas m
      LEFT JOIN programas_produccion p ON m.numero = p.maquina_numero
      GROUP BY m.numero, m.nombre, m.estado
      ORDER BY m.numero
    `);
    
    res.json({
      estadosProgramas: estadoStats,
      estadisticasMaquinas: maquinaStats
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Iniciar servidor
async function startServer() {
  // Probar conexión a la base de datos
  const dbConnected = await testConnection();
  
  if (!dbConnected) {
    console.log('⚠️  Iniciando sin conexión a MySQL - Verifica la configuración');
    console.log('💡 Copia .env.example a .env y configura tus credenciales');
  }
  
  app.listen(PORT, () => {
    console.log('🚀 Backend FlexoApp (MySQL) iniciado en http://localhost:' + PORT);
    console.log('🗄️  Base de datos:', dbConfig.database);
    console.log('🔗 Host MySQL:', dbConfig.host + ':' + dbConfig.port);
    console.log('');
    console.log('🔗 Endpoints disponibles:');
    console.log('   GET  /api/test');
    console.log('   GET  /api/stats');
    console.log('   GET  /api/machines');
    console.log('   GET  /api/workorders');
    console.log('   POST /api/workorders');
    console.log('   PUT  /api/workorders/:id');
    console.log('   DELETE /api/workorders/:id');
    console.log('');
    console.log('✅ Listo para recibir conexiones desde Angular!');
  });
}

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Ruta 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint no encontrado' });
});

// Manejo de cierre graceful
process.on('SIGINT', async () => {
  console.log('\n🔄 Cerrando servidor...');
  await pool.end();
  console.log('✅ Conexiones cerradas');
  process.exit(0);
});

startServer();
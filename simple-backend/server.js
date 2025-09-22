const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));
app.use(express.json());

// Datos en memoria (simulando base de datos)
let machines = [
  { numero: 11, nombre: 'Máquina #11', estado: 'activa', eficiencia: 94.2, horasOperacion: 156, fechaActualizacion: new Date() },
  { numero: 12, nombre: 'Máquina #12', estado: 'activa', eficiencia: 91.8, horasOperacion: 142, fechaActualizacion: new Date() },
  { numero: 13, nombre: 'Máquina #13', estado: 'mantenimiento', eficiencia: 0, horasOperacion: 0, fechaActualizacion: new Date() },
  { numero: 14, nombre: 'Máquina #14', estado: 'activa', eficiencia: 88.5, horasOperacion: 178, fechaActualizacion: new Date() },
  { numero: 15, nombre: 'Máquina #15', estado: 'activa', eficiencia: 92.3, horasOperacion: 165, fechaActualizacion: new Date() },
  { numero: 16, nombre: 'Máquina #16', estado: 'parada', eficiencia: 0, horasOperacion: 0, fechaActualizacion: new Date() },
  { numero: 17, nombre: 'Máquina #17', estado: 'activa', eficiencia: 89.7, horasOperacion: 134, fechaActualizacion: new Date() },
  { numero: 18, nombre: 'Máquina #18', estado: 'activa', eficiencia: 93.1, horasOperacion: 187, fechaActualizacion: new Date() },
  { numero: 19, nombre: 'Máquina #19', estado: 'activa', eficiencia: 90.4, horasOperacion: 145, fechaActualizacion: new Date() },
  { numero: 20, nombre: 'Máquina #20', estado: 'mantenimiento', eficiencia: 0, horasOperacion: 0, fechaActualizacion: new Date() },
  { numero: 21, nombre: 'Máquina #21', estado: 'activa', eficiencia: 87.9, horasOperacion: 198, fechaActualizacion: new Date() }
];

let workOrders = [
  { 
    id: 1, 
    articulo: 'F203456', 
    otSap: '296571', 
    cliente: 'Productos Vicky', 
    referencia: 'Kythos Mixtos Natural', 
    td: 'R', 
    colores: 8, 
    kilosSustrato: 250,
    kilos: 1200,
    estado: 'listo', 
    maquina: 11,
    sustrato: 'BOPP Sell Transp',
    coloresDetalle: JSON.stringify([
      { nombre: 'Amarillo', hex: '#FFFF00', tipo: 'primario' },
      { nombre: 'Blanco', hex: '#FFFFFF', tipo: 'primario' },
      { nombre: 'Cyan', hex: '#00FFFF', tipo: 'primario' },
      { nombre: 'Magenta', hex: '#FF00FF', tipo: 'primario' },
      { nombre: 'Negro', hex: '#000000', tipo: 'primario' },
      { nombre: 'Pantone V179', hex: '#E6194B', tipo: 'pantone' },
      { nombre: 'Pantone C299', hex: '#3CB44B', tipo: 'pantone' },
      { nombre: 'Crema', hex: '#FFFDD0', tipo: 'primario' }
    ]),
    fechaCreacion: new Date('2024-01-01'),
    fechaActualizacion: new Date(),
    usuarioActualizacion: 'system'
  },
  { 
    id: 2, 
    articulo: 'F203457', 
    otSap: '296572', 
    cliente: 'Productos Vicky', 
    referencia: 'Kythos Premium', 
    td: 'R', 
    colores: 6, 
    kilosSustrato: 180,
    kilos: 850,
    estado: 'corriendo', 
    maquina: 12,
    sustrato: 'BOPP Sell Transp',
    coloresDetalle: JSON.stringify([
      { nombre: 'Amarillo', hex: '#FFFF00', tipo: 'primario' },
      { nombre: 'Blanco', hex: '#FFFFFF', tipo: 'primario' },
      { nombre: 'Cyan', hex: '#00FFFF', tipo: 'primario' },
      { nombre: 'Magenta', hex: '#FF00FF', tipo: 'primario' },
      { nombre: 'Negro', hex: '#000000', tipo: 'primario' },
      { nombre: 'Pantone V179', hex: '#E6194B', tipo: 'pantone' }
    ]),
    fechaCreacion: new Date('2024-01-01'),
    fechaActualizacion: new Date(),
    usuarioActualizacion: 'system'
  },
  { 
    id: 3, 
    articulo: 'F203458', 
    otSap: '296573', 
    cliente: 'Productos Vicky', 
    referencia: 'Kythos Especial', 
    td: 'R', 
    colores: 4, 
    kilosSustrato: 320,
    kilos: 950,
    estado: 'suspendido', 
    motivoSuspension: 'Falta material', 
    maquina: 14,
    sustrato: 'BOPP Sell Transp',
    coloresDetalle: JSON.stringify([
      { nombre: 'Amarillo', hex: '#FFFF00', tipo: 'primario' },
      { nombre: 'Blanco', hex: '#FFFFFF', tipo: 'primario' },
      { nombre: 'Cyan', hex: '#00FFFF', tipo: 'primario' },
      { nombre: 'Negro', hex: '#000000', tipo: 'primario' }
    ]),
    fechaCreacion: new Date('2024-01-01'),
    fechaActualizacion: new Date(),
    usuarioActualizacion: 'system'
  },
  { 
    id: 4, 
    articulo: 'F203459', 
    otSap: '296574', 
    cliente: 'Productos Vicky', 
    referencia: 'Kythos Deluxe', 
    td: 'R', 
    colores: 5, 
    kilosSustrato: 200,
    kilos: 750,
    estado: 'terminado', 
    maquina: 15,
    sustrato: 'BOPP Sell Transp',
    coloresDetalle: JSON.stringify([
      { nombre: 'Amarillo', hex: '#FFFF00', tipo: 'primario' },
      { nombre: 'Blanco', hex: '#FFFFFF', tipo: 'primario' },
      { nombre: 'Cyan', hex: '#00FFFF', tipo: 'primario' },
      { nombre: 'Negro', hex: '#000000', tipo: 'primario' },
      { nombre: 'Pantone C299', hex: '#3CB44B', tipo: 'pantone' }
    ]),
    fechaCreacion: new Date('2024-01-01'),
    fechaActualizacion: new Date(),
    usuarioActualizacion: 'system'
  },
  { 
    id: 5, 
    articulo: 'F203460', 
    otSap: '296575', 
    cliente: 'Productos Vicky', 
    referencia: 'Kythos Classic', 
    td: 'R', 
    colores: 3, 
    kilosSustrato: 150,
    kilos: 600,
    estado: 'listo', 
    maquina: 17,
    sustrato: 'BOPP Sell Transp',
    coloresDetalle: JSON.stringify([
      { nombre: 'Amarillo', hex: '#FFFF00', tipo: 'primario' },
      { nombre: 'Negro', hex: '#000000', tipo: 'primario' },
      { nombre: 'Pantone V179', hex: '#E6194B', tipo: 'pantone' }
    ]),
    fechaCreacion: new Date('2024-01-01'),
    fechaActualizacion: new Date(),
    usuarioActualizacion: 'system'
  }
];

let nextId = 6;

// Rutas para máquinas
app.get('/api/machines', (req, res) => {
  console.log('GET /api/machines - Enviando', machines.length, 'máquinas');
  res.json(machines);
});

app.get('/api/machines/:numero', (req, res) => {
  const numero = parseInt(req.params.numero);
  const machine = machines.find(m => m.numero === numero);
  
  if (!machine) {
    return res.status(404).json({ error: 'Máquina no encontrada' });
  }
  
  console.log('GET /api/machines/' + numero);
  res.json(machine);
});

// Rutas para órdenes de trabajo
app.get('/api/workorders', (req, res) => {
  console.log('GET /api/workorders - Enviando', workOrders.length, 'programas');
  
  // Parsear coloresDetalle para el frontend
  const ordersWithParsedColors = workOrders.map(order => ({
    ...order,
    coloresDetalle: typeof order.coloresDetalle === 'string' 
      ? JSON.parse(order.coloresDetalle) 
      : order.coloresDetalle
  }));
  
  res.json(ordersWithParsedColors);
});

app.get('/api/workorders/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const order = workOrders.find(o => o.id === id);
  
  if (!order) {
    return res.status(404).json({ error: 'Programa no encontrado' });
  }
  
  // Parsear coloresDetalle
  const orderWithParsedColors = {
    ...order,
    coloresDetalle: typeof order.coloresDetalle === 'string' 
      ? JSON.parse(order.coloresDetalle) 
      : order.coloresDetalle
  };
  
  console.log('GET /api/workorders/' + id);
  res.json(orderWithParsedColors);
});

app.get('/api/workorders/machine/:machineNumber', (req, res) => {
  const machineNumber = parseInt(req.params.machineNumber);
  const machineOrders = workOrders.filter(o => o.maquina === machineNumber);
  
  // Parsear coloresDetalle
  const ordersWithParsedColors = machineOrders.map(order => ({
    ...order,
    coloresDetalle: typeof order.coloresDetalle === 'string' 
      ? JSON.parse(order.coloresDetalle) 
      : order.coloresDetalle
  }));
  
  console.log('GET /api/workorders/machine/' + machineNumber + ' - Enviando', ordersWithParsedColors.length, 'programas');
  res.json(ordersWithParsedColors);
});

app.post('/api/workorders', (req, res) => {
  const newOrder = {
    id: nextId++,
    ...req.body,
    coloresDetalle: typeof req.body.coloresDetalle === 'string' 
      ? req.body.coloresDetalle 
      : JSON.stringify(req.body.coloresDetalle),
    fechaCreacion: new Date(),
    fechaActualizacion: new Date()
  };
  
  workOrders.push(newOrder);
  
  // Devolver con coloresDetalle parseado
  const responseOrder = {
    ...newOrder,
    coloresDetalle: typeof newOrder.coloresDetalle === 'string' 
      ? JSON.parse(newOrder.coloresDetalle) 
      : newOrder.coloresDetalle
  };
  
  console.log('POST /api/workorders - Programa creado con ID:', newOrder.id);
  res.status(201).json(responseOrder);
});

app.put('/api/workorders/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const orderIndex = workOrders.findIndex(o => o.id === id);
  
  if (orderIndex === -1) {
    return res.status(404).json({ error: 'Programa no encontrado' });
  }
  
  // Actualizar campos
  const updatedOrder = {
    ...workOrders[orderIndex],
    ...req.body,
    fechaActualizacion: new Date()
  };
  
  // Si se envían coloresDetalle, asegurar que estén como string
  if (req.body.coloresDetalle && typeof req.body.coloresDetalle !== 'string') {
    updatedOrder.coloresDetalle = JSON.stringify(req.body.coloresDetalle);
  }
  
  workOrders[orderIndex] = updatedOrder;
  
  // Devolver con coloresDetalle parseado
  const responseOrder = {
    ...updatedOrder,
    coloresDetalle: typeof updatedOrder.coloresDetalle === 'string' 
      ? JSON.parse(updatedOrder.coloresDetalle) 
      : updatedOrder.coloresDetalle
  };
  
  console.log('PUT /api/workorders/' + id + ' - Estado actualizado a:', req.body.estado);
  res.json(responseOrder);
});

app.delete('/api/workorders/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const orderIndex = workOrders.findIndex(o => o.id === id);
  
  if (orderIndex === -1) {
    return res.status(404).json({ error: 'Programa no encontrado' });
  }
  
  workOrders.splice(orderIndex, 1);
  console.log('DELETE /api/workorders/' + id + ' - Programa eliminado');
  res.status(204).send();
});

// Ruta de prueba
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend funcionando correctamente!', 
    timestamp: new Date(),
    machines: machines.length,
    workOrders: workOrders.length
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log('🚀 Backend FlexoApp iniciado en http://localhost:' + PORT);
  console.log('📊 Datos cargados:');
  console.log('   - Máquinas:', machines.length);
  console.log('   - Programas de producción:', workOrders.length);
  console.log('');
  console.log('🔗 Endpoints disponibles:');
  console.log('   GET  /api/test');
  console.log('   GET  /api/machines');
  console.log('   GET  /api/workorders');
  console.log('   POST /api/workorders');
  console.log('   PUT  /api/workorders/:id');
  console.log('   DELETE /api/workorders/:id');
  console.log('');
  console.log('✅ Listo para recibir conexiones desde Angular!');
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Ruta 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint no encontrado' });
});
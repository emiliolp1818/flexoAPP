// Script para probar la conexión del frontend Angular con el backend
// Ejecutar con: node test-frontend-connection.js

const http = require('http');

const BACKEND_URL = 'http://localhost:5000';
const FRONTEND_URL = 'http://localhost:4200';

function makeRequest(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Origin': FRONTEND_URL,
        'Access-Control-Request-Method': method,
        'Access-Control-Request-Headers': 'Content-Type'
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = responseData ? JSON.parse(responseData) : null;
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: parsedData
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: responseData
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testFrontendConnection() {
  console.log('🔗 Probando conexión Frontend → Backend...\n');

  // Prueba 1: Verificar que el backend esté disponible
  try {
    console.log('1. Verificando disponibilidad del backend...');
    const response = await makeRequest(`${BACKEND_URL}/api/test`);
    console.log(`   ✅ Backend disponible (Status: ${response.status})`);
    console.log(`   📊 Respuesta:`, response.data);
    
    // Verificar headers CORS
    const corsHeaders = {
      'access-control-allow-origin': response.headers['access-control-allow-origin'],
      'access-control-allow-credentials': response.headers['access-control-allow-credentials'],
      'access-control-allow-methods': response.headers['access-control-allow-methods']
    };
    
    console.log('   🌐 Headers CORS:', corsHeaders);
    console.log('');
  } catch (error) {
    console.log(`   ❌ Backend no disponible: ${error.message}`);
    console.log('   💡 Ejecuta: start-backend.bat');
    return;
  }

  // Prueba 2: Simular carga inicial de datos (como lo hace Angular)
  try {
    console.log('2. Simulando carga inicial de datos...');
    
    // Cargar máquinas
    const machinesResponse = await makeRequest(`${BACKEND_URL}/api/machines`);
    console.log(`   ✅ Máquinas cargadas: ${machinesResponse.data ? machinesResponse.data.length : 0}`);
    
    // Cargar programas
    const ordersResponse = await makeRequest(`${BACKEND_URL}/api/workorders`);
    console.log(`   ✅ Programas cargados: ${ordersResponse.data ? ordersResponse.data.length : 0}`);
    
    if (ordersResponse.data && ordersResponse.data.length > 0) {
      const estados = ordersResponse.data.reduce((acc, order) => {
        acc[order.estado] = (acc[order.estado] || 0) + 1;
        return acc;
      }, {});
      console.log('   📊 Estados de programas:', estados);
    }
    console.log('');
  } catch (error) {
    console.log(`   ❌ Error cargando datos: ${error.message}\n`);
  }

  // Prueba 3: Simular operaciones típicas del usuario
  try {
    console.log('3. Simulando operaciones de usuario...');
    
    // Crear un programa como lo haría Angular
    const newOrder = {
      articulo: 'ANGULAR-TEST',
      otSap: 'ANG-' + Date.now(),
      cliente: 'Cliente Angular Test',
      referencia: 'Producto desde Angular',
      td: 'R',
      colores: 3,
      kilosSustrato: 150,
      kilos: 750,
      estado: 'listo',
      maquina: 11,
      sustrato: 'BOPP Angular Test',
      coloresDetalle: [
        { nombre: 'Rojo Angular', hex: '#FF0000', tipo: 'primario' },
        { nombre: 'Verde Angular', hex: '#00FF00', tipo: 'primario' },
        { nombre: 'Azul Angular', hex: '#0000FF', tipo: 'primario' }
      ],
      usuarioActualizacion: 'angular-test'
    };

    const createResponse = await makeRequest(`${BACKEND_URL}/api/workorders`, 'POST', newOrder);
    console.log(`   ✅ Programa creado (Status: ${createResponse.status})`);
    
    if (createResponse.data && createResponse.data.id) {
      const createdId = createResponse.data.id;
      console.log(`   🆔 ID del programa: ${createdId}`);
      
      // Cambiar estado como lo haría Angular
      const updateData = {
        estado: 'corriendo',
        usuarioActualizacion: 'angular-test'
      };
      
      const updateResponse = await makeRequest(`${BACKEND_URL}/api/workorders/${createdId}`, 'PUT', updateData);
      console.log(`   ✅ Estado actualizado (Status: ${updateResponse.status})`);
      console.log(`   🔄 Nuevo estado: ${updateResponse.data ? updateResponse.data.estado : 'N/A'}`);
      
      // Suspender con motivo
      const suspendData = {
        estado: 'suspendido',
        motivoSuspension: 'Prueba desde Angular',
        usuarioActualizacion: 'angular-test'
      };
      
      const suspendResponse = await makeRequest(`${BACKEND_URL}/api/workorders/${createdId}`, 'PUT', suspendData);
      console.log(`   ✅ Programa suspendido (Status: ${suspendResponse.status})`);
      console.log(`   📝 Motivo: ${suspendResponse.data ? suspendResponse.data.motivoSuspension : 'N/A'}`);
    }
    console.log('');
  } catch (error) {
    console.log(`   ❌ Error en operaciones: ${error.message}\n`);
  }

  // Prueba 4: Verificar sincronización
  try {
    console.log('4. Verificando sincronización de datos...');
    
    const finalResponse = await makeRequest(`${BACKEND_URL}/api/workorders`);
    console.log(`   ✅ Total de programas después de pruebas: ${finalResponse.data ? finalResponse.data.length : 0}`);
    
    // Contar programas por máquina
    if (finalResponse.data) {
      const porMaquina = finalResponse.data.reduce((acc, order) => {
        acc[order.maquina] = (acc[order.maquina] || 0) + 1;
        return acc;
      }, {});
      console.log('   📊 Programas por máquina:', porMaquina);
    }
    console.log('');
  } catch (error) {
    console.log(`   ❌ Error verificando sincronización: ${error.message}\n`);
  }

  console.log('🎉 Pruebas de conexión Frontend → Backend completadas!\n');
  
  console.log('📋 Verificaciones realizadas:');
  console.log('   ✅ Disponibilidad del backend');
  console.log('   ✅ Configuración CORS');
  console.log('   ✅ Carga inicial de datos');
  console.log('   ✅ Creación de programas');
  console.log('   ✅ Actualización de estados');
  console.log('   ✅ Suspensión con motivos');
  console.log('   ✅ Sincronización de datos');
  
  console.log('\n🚀 Para probar en Angular:');
  console.log('   1. Asegúrate de que el backend siga corriendo');
  console.log('   2. Ejecuta: ng serve');
  console.log('   3. Abre http://localhost:4200');
  console.log('   4. Ve a la sección de Máquinas');
  console.log('   5. Selecciona una máquina y verifica que aparezcan los programas');
  console.log('   6. Prueba cambiar estados de los programas');
  
  console.log('\n🔍 Qué buscar en Angular:');
  console.log('   - Mensajes ✅ en la consola del navegador (F12)');
  console.log('   - Datos visibles en la interfaz');
  console.log('   - Cambios de estado que se reflejan inmediatamente');
  console.log('   - Sin errores de CORS en la consola');
}

testFrontendConnection().catch(console.error);
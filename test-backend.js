// Script completo para probar la conexión entre backend y frontend
// Ejecutar con: node test-backend.js

const http = require('http');

const API_URL = 'http://localhost:5000';
const FRONTEND_URL = 'http://localhost:4200';

function testEndpoint(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
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
            data: parsedData
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
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

async function runTests() {
  console.log('🔧 Iniciando pruebas del backend...\n');

  // Prueba 1: Verificar que el servidor esté corriendo
  try {
    console.log('1. Probando conexión básica...');
    const response = await testEndpoint('/api/machines');
    console.log(`   ✅ Servidor respondió con status: ${response.status}`);
    console.log(`   📊 Máquinas encontradas: ${response.data ? response.data.length : 0}\n`);
  } catch (error) {
    console.log(`   ❌ Error de conexión: ${error.message}`);
    console.log('   💡 Asegúrate de que el backend esté corriendo en http://localhost:5000\n');
    return;
  }

  // Prueba 2: Obtener órdenes de trabajo
  try {
    console.log('2. Probando endpoint de programas de producción...');
    const response = await testEndpoint('/api/workorders');
    console.log(`   ✅ Status: ${response.status}`);
    console.log(`   📋 Programas encontrados: ${response.data ? response.data.length : 0}\n`);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }

  // Prueba 3: Crear un programa de prueba
  try {
    console.log('3. Creando programa de prueba...');
    const testOrder = {
      articulo: 'TEST001',
      otSap: 'TEST-' + Date.now(),
      cliente: 'Cliente de Prueba',
      referencia: 'Producto de Prueba',
      td: 'R',
      colores: 4,
      kilosSustrato: 100,
      kilos: 500,
      estado: 'listo',
      maquina: 11,
      sustrato: 'BOPP Test',
      coloresDetalle: JSON.stringify([
        { nombre: 'Rojo', hex: '#FF0000', tipo: 'primario' },
        { nombre: 'Azul', hex: '#0000FF', tipo: 'primario' }
      ]),
      usuarioActualizacion: 'test-script'
    };

    const response = await testEndpoint('/api/workorders', 'POST', testOrder);
    console.log(`   ✅ Status: ${response.status}`);
    if (response.data && response.data.id) {
      console.log(`   🆔 Programa creado con ID: ${response.data.id}`);
      
      // Prueba 4: Actualizar el programa creado
      console.log('\n4. Actualizando programa creado...');
      const updateData = {
        estado: 'corriendo',
        usuarioActualizacion: 'test-script'
      };
      
      const updateResponse = await testEndpoint(`/api/workorders/${response.data.id}`, 'PUT', updateData);
      console.log(`   ✅ Status: ${updateResponse.status}`);
      console.log(`   🔄 Estado actualizado a: ${updateResponse.data ? updateResponse.data.estado : 'N/A'}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  console.log('\n🎉 Pruebas completadas!');
  console.log('\n💡 Si todas las pruebas pasaron, el backend está funcionando correctamente.');
  console.log('   Ahora puedes usar la aplicación Angular para interactuar con la base de datos.');
}

runTests().catch(console.error);
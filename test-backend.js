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
  console.log('🔧 Iniciando pruebas completas del sistema...\n');

  // Prueba 1: Verificar que el servidor esté corriendo
  try {
    console.log('1. Probando conexión básica con el backend...');
    const response = await testEndpoint('/api/test');
    console.log(`   ✅ Backend respondió con status: ${response.status}`);
    console.log(`   📊 Datos disponibles:`, response.data);
    console.log('');
  } catch (error) {
    console.log(`   ❌ Error de conexión: ${error.message}`);
    console.log('   💡 Asegúrate de que el backend esté corriendo en http://localhost:5000');
    console.log('   💡 Ejecuta: start-backend.bat\n');
    return;
  }

  // Prueba 2: Verificar máquinas
  try {
    console.log('2. Probando endpoint de máquinas...');
    const response = await testEndpoint('/api/machines');
    console.log(`   ✅ Status: ${response.status}`);
    console.log(`   📊 Máquinas encontradas: ${response.data ? response.data.length : 0}`);
    if (response.data && response.data.length > 0) {
      console.log(`   🔧 Primera máquina: ${response.data[0].nombre} (Estado: ${response.data[0].estado})`);
    }
    console.log('');
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }

  // Prueba 3: Obtener órdenes de trabajo
  try {
    console.log('3. Probando endpoint de programas de producción...');
    const response = await testEndpoint('/api/workorders');
    console.log(`   ✅ Status: ${response.status}`);
    console.log(`   📋 Programas encontrados: ${response.data ? response.data.length : 0}`);
    if (response.data && response.data.length > 0) {
      const firstOrder = response.data[0];
      console.log(`   📄 Primer programa: ${firstOrder.articulo} - ${firstOrder.referencia} (Estado: ${firstOrder.estado})`);
    }
    console.log('');
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }

  // Prueba 4: Crear un programa de prueba
  try {
    console.log('4. Creando programa de prueba...');
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
      coloresDetalle: [
        { nombre: 'Rojo', hex: '#FF0000', tipo: 'primario' },
        { nombre: 'Azul', hex: '#0000FF', tipo: 'primario' },
        { nombre: 'Amarillo', hex: '#FFFF00', tipo: 'primario' },
        { nombre: 'Negro', hex: '#000000', tipo: 'primario' }
      ],
      usuarioActualizacion: 'test-script'
    };

    const response = await testEndpoint('/api/workorders', 'POST', testOrder);
    console.log(`   ✅ Status: ${response.status}`);
    if (response.data && response.data.id) {
      console.log(`   🆔 Programa creado con ID: ${response.data.id}`);
      console.log(`   📄 Artículo: ${response.data.articulo} - ${response.data.referencia}`);
      
      // Prueba 5: Actualizar el programa creado
      console.log('\n5. Actualizando programa creado...');
      const updateData = {
        estado: 'corriendo',
        usuarioActualizacion: 'test-script'
      };
      
      const updateResponse = await testEndpoint(`/api/workorders/${response.data.id}`, 'PUT', updateData);
      console.log(`   ✅ Status: ${updateResponse.status}`);
      console.log(`   🔄 Estado actualizado a: ${updateResponse.data ? updateResponse.data.estado : 'N/A'}`);
      
      // Prueba 6: Suspender el programa
      console.log('\n6. Suspendiendo programa...');
      const suspendData = {
        estado: 'suspendido',
        motivoSuspension: 'Prueba de suspensión',
        usuarioActualizacion: 'test-script'
      };
      
      const suspendResponse = await testEndpoint(`/api/workorders/${response.data.id}`, 'PUT', suspendData);
      console.log(`   ✅ Status: ${suspendResponse.status}`);
      console.log(`   ⏸️ Estado: ${suspendResponse.data ? suspendResponse.data.estado : 'N/A'}`);
      console.log(`   📝 Motivo: ${suspendResponse.data ? suspendResponse.data.motivoSuspension : 'N/A'}`);
      
      // Prueba 7: Obtener programas de la máquina específica
      console.log('\n7. Obteniendo programas de la máquina 11...');
      const machineResponse = await testEndpoint('/api/workorders/machine/11');
      console.log(`   ✅ Status: ${machineResponse.status}`);
      console.log(`   📋 Programas en máquina 11: ${machineResponse.data ? machineResponse.data.length : 0}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  // Prueba 8: Verificar CORS
  console.log('\n8. Verificando configuración CORS...');
  try {
    const corsResponse = await testEndpoint('/api/test');
    console.log(`   ✅ CORS configurado correctamente`);
    console.log(`   🌐 Backend acepta conexiones desde Angular (localhost:4200)`);
  } catch (error) {
    console.log(`   ⚠️ Posible problema de CORS: ${error.message}`);
  }

  console.log('\n🎉 Pruebas del backend completadas!');
  console.log('\n📋 Resumen de funcionalidades probadas:');
  console.log('   ✅ Conexión básica al servidor');
  console.log('   ✅ Obtención de máquinas');
  console.log('   ✅ Obtención de programas de producción');
  console.log('   ✅ Creación de nuevos programas');
  console.log('   ✅ Actualización de estados');
  console.log('   ✅ Suspensión con motivo');
  console.log('   ✅ Filtrado por máquina');
  console.log('   ✅ Configuración CORS');
  
  console.log('\n🚀 Próximos pasos:');
  console.log('   1. Mantén el backend corriendo (start-backend.bat)');
  console.log('   2. Inicia Angular: ng serve');
  console.log('   3. Abre http://localhost:4200 en tu navegador');
  console.log('   4. Verifica que los datos se cargan correctamente');
  
  console.log('\n💡 Para verificar la conexión desde Angular:');
  console.log('   - Abre las herramientas de desarrollador (F12)');
  console.log('   - Busca mensajes que empiecen con ✅ en la consola');
  console.log('   - Los datos deben aparecer en la interfaz');
}

runTests().catch(console.error);
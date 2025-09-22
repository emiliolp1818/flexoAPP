// Script completo para probar la conexión Frontend-Backend
// Ejecutar con: node test-frontend-backend.js

const http = require('http');
const https = require('https');

const BACKEND_URL = 'http://localhost:5000';
const FRONTEND_URL = 'http://localhost:4200';

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

function testEndpoint(url, path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url + path);
    const isHttps = urlObj.protocol === 'https:';
    const httpModule = isHttps ? https : http;
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'FlexoApp-Test-Script'
      }
    };

    const req = httpModule.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = responseData ? JSON.parse(responseData) : null;
          resolve({
            status: res.statusCode,
            data: parsedData,
            headers: res.headers
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: responseData,
            headers: res.headers
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

async function testBackendConnection() {
  log('\n🔧 === PRUEBAS DEL BACKEND ===', 'cyan');
  
  try {
    log('\n1. Probando conexión básica del backend...', 'blue');
    const response = await testEndpoint(BACKEND_URL, '/api/test');
    
    if (response.status === 200) {
      log(`   ✅ Backend respondió correctamente (${response.status})`, 'green');
      log(`   📊 Datos: ${JSON.stringify(response.data, null, 2)}`, 'yellow');
      return true;
    } else {
      log(`   ⚠️ Backend respondió con status: ${response.status}`, 'yellow');
      return false;
    }
  } catch (error) {
    log(`   ❌ Error de conexión: ${error.message}`, 'red');
    log('   💡 Asegúrate de ejecutar: start-backend.bat', 'yellow');
    return false;
  }
}

async function testBackendEndpoints() {
  log('\n2. Probando endpoints del backend...', 'blue');
  
  const endpoints = [
    { path: '/api/machines', name: 'Máquinas' },
    { path: '/api/workorders', name: 'Programas de producción' }
  ];

  let allPassed = true;

  for (const endpoint of endpoints) {
    try {
      const response = await testEndpoint(BACKEND_URL, endpoint.path);
      
      if (response.status === 200) {
        const count = Array.isArray(response.data) ? response.data.length : 'N/A';
        log(`   ✅ ${endpoint.name}: ${count} elementos`, 'green');
      } else {
        log(`   ❌ ${endpoint.name}: Status ${response.status}`, 'red');
        allPassed = false;
      }
    } catch (error) {
      log(`   ❌ ${endpoint.name}: ${error.message}`, 'red');
      allPassed = false;
    }
  }

  return allPassed;
}

async function testBackendCRUD() {
  log('\n3. Probando operaciones CRUD...', 'blue');
  
  try {
    // Crear un programa de prueba
    const testProgram = {
      articulo: 'TEST-' + Date.now(),
      otSap: 'OT-TEST-' + Date.now(),
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
        { nombre: 'Azul', hex: '#0000FF', tipo: 'primario' }
      ],
      usuarioActualizacion: 'test-script'
    };

    log('   📝 Creando programa de prueba...', 'yellow');
    const createResponse = await testEndpoint(BACKEND_URL, '/api/workorders', 'POST', testProgram);
    
    if (createResponse.status === 201 && createResponse.data.id) {
      log(`   ✅ Programa creado con ID: ${createResponse.data.id}`, 'green');
      
      // Actualizar el programa
      log('   🔄 Actualizando programa...', 'yellow');
      const updateData = {
        estado: 'corriendo',
        usuarioActualizacion: 'test-script'
      };
      
      const updateResponse = await testEndpoint(
        BACKEND_URL, 
        `/api/workorders/${createResponse.data.id}`, 
        'PUT', 
        updateData
      );
      
      if (updateResponse.status === 200) {
        log(`   ✅ Programa actualizado a estado: ${updateResponse.data.estado}`, 'green');
        
        // Eliminar el programa de prueba
        log('   🗑️ Eliminando programa de prueba...', 'yellow');
        const deleteResponse = await testEndpoint(
          BACKEND_URL, 
          `/api/workorders/${createResponse.data.id}`, 
          'DELETE'
        );
        
        if (deleteResponse.status === 204) {
          log('   ✅ Programa eliminado correctamente', 'green');
          return true;
        } else {
          log(`   ⚠️ Error al eliminar: Status ${deleteResponse.status}`, 'yellow');
        }
      } else {
        log(`   ❌ Error al actualizar: Status ${updateResponse.status}`, 'red');
      }
    } else {
      log(`   ❌ Error al crear programa: Status ${createResponse.status}`, 'red');
    }
  } catch (error) {
    log(`   ❌ Error en operaciones CRUD: ${error.message}`, 'red');
  }
  
  return false;
}

async function testFrontendConnection() {
  log('\n🌐 === PRUEBAS DEL FRONTEND ===', 'cyan');
  
  try {
    log('\n1. Probando conexión del frontend Angular...', 'blue');
    const response = await testEndpoint(FRONTEND_URL, '/');
    
    if (response.status === 200) {
      log(`   ✅ Frontend respondió correctamente (${response.status})`, 'green');
      return true;
    } else {
      log(`   ⚠️ Frontend respondió con status: ${response.status}`, 'yellow');
      return false;
    }
  } catch (error) {
    log(`   ❌ Error de conexión: ${error.message}`, 'red');
    log('   💡 Asegúrate de ejecutar: ng serve', 'yellow');
    return false;
  }
}

async function testCORSConfiguration() {
  log('\n🔒 === PRUEBAS DE CORS ===', 'cyan');
  
  try {
    log('\n1. Verificando configuración CORS...', 'blue');
    const response = await testEndpoint(BACKEND_URL, '/api/test');
    
    const corsHeaders = {
      'access-control-allow-origin': response.headers['access-control-allow-origin'],
      'access-control-allow-methods': response.headers['access-control-allow-methods'],
      'access-control-allow-headers': response.headers['access-control-allow-headers']
    };
    
    log('   📋 Headers CORS encontrados:', 'yellow');
    Object.entries(corsHeaders).forEach(([key, value]) => {
      if (value) {
        log(`      ${key}: ${value}`, 'green');
      } else {
        log(`      ${key}: No configurado`, 'red');
      }
    });
    
    if (corsHeaders['access-control-allow-origin']) {
      log('   ✅ CORS configurado correctamente', 'green');
      return true;
    } else {
      log('   ⚠️ CORS podría no estar configurado', 'yellow');
      return false;
    }
  } catch (error) {
    log(`   ❌ Error verificando CORS: ${error.message}`, 'red');
    return false;
  }
}

async function generateTestReport() {
  log('\n📊 === REPORTE DE PRUEBAS ===', 'magenta');
  
  const results = {
    backendConnection: false,
    backendEndpoints: false,
    backendCRUD: false,
    frontendConnection: false,
    corsConfiguration: false
  };
  
  // Ejecutar todas las pruebas
  results.backendConnection = await testBackendConnection();
  
  if (results.backendConnection) {
    results.backendEndpoints = await testBackendEndpoints();
    results.backendCRUD = await testBackendCRUD();
    results.corsConfiguration = await testCORSConfiguration();
  }
  
  results.frontendConnection = await testFrontendConnection();
  
  // Generar reporte
  log('\n📋 Resumen de resultados:', 'bright');
  log('================================', 'bright');
  
  const tests = [
    { name: 'Conexión Backend', result: results.backendConnection },
    { name: 'Endpoints Backend', result: results.backendEndpoints },
    { name: 'Operaciones CRUD', result: results.backendCRUD },
    { name: 'Conexión Frontend', result: results.frontendConnection },
    { name: 'Configuración CORS', result: results.corsConfiguration }
  ];
  
  tests.forEach(test => {
    const status = test.result ? '✅ PASS' : '❌ FAIL';
    const color = test.result ? 'green' : 'red';
    log(`${status} ${test.name}`, color);
  });
  
  const passedTests = tests.filter(t => t.result).length;
  const totalTests = tests.length;
  
  log('\n📊 Estadísticas:', 'bright');
  log(`   Pruebas pasadas: ${passedTests}/${totalTests}`, passedTests === totalTests ? 'green' : 'yellow');
  log(`   Porcentaje de éxito: ${Math.round((passedTests/totalTests) * 100)}%`, passedTests === totalTests ? 'green' : 'yellow');
  
  // Recomendaciones
  log('\n💡 Recomendaciones:', 'bright');
  
  if (!results.backendConnection) {
    log('   🔧 Ejecuta: start-backend.bat para iniciar el backend', 'yellow');
  }
  
  if (!results.frontendConnection) {
    log('   🔧 Ejecuta: ng serve para iniciar Angular', 'yellow');
  }
  
  if (results.backendConnection && results.frontendConnection) {
    log('   🎉 ¡Conexión Frontend-Backend lista!', 'green');
    log('   🚀 Puedes usar la aplicación normalmente', 'green');
  }
  
  return results;
}

// Función principal
async function main() {
  log('🚀 FlexoApp - Test de Conexión Frontend-Backend', 'bright');
  log('================================================', 'bright');
  log('Este script verifica que el frontend y backend se conecten correctamente.\n', 'yellow');
  
  try {
    await generateTestReport();
  } catch (error) {
    log(`\n❌ Error general: ${error.message}`, 'red');
  }
  
  log('\n🏁 Pruebas completadas.', 'bright');
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testEndpoint, testBackendConnection, testFrontendConnection };
// Script simple para verificar la conexión
const http = require('http');

console.log('🔧 Verificando conexión con el backend...\n');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/test',
  method: 'GET',
  timeout: 5000
};

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('✅ Backend funcionando correctamente!');
      console.log('📊 Respuesta del servidor:', response);
      console.log('\n🎉 Conexión exitosa!');
      console.log('\n💡 Próximos pasos:');
      console.log('   1. El backend está corriendo en http://localhost:5000');
      console.log('   2. Ahora puedes iniciar Angular con: ng serve');
      console.log('   3. Angular estará disponible en: http://localhost:4200');
    } catch (error) {
      console.log('⚠️ Respuesta recibida pero no es JSON válido:', data);
    }
  });
});

req.on('error', (error) => {
  console.log('❌ No se pudo conectar al backend');
  console.log('💡 Asegúrate de que el backend esté corriendo:');
  console.log('   - Ejecuta: start-backend.bat');
  console.log('   - O manualmente: cd simple-backend && npm start');
  console.log('   - Verifica que veas el mensaje: "Backend FlexoApp iniciado"');
});

req.on('timeout', () => {
  console.log('⏰ Timeout - El backend no respondió en 5 segundos');
  req.destroy();
});

req.end();
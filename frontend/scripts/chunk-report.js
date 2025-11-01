const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Script para generar reporte de chunks y su rendimiento
 */

console.log('🔍 Generando reporte de chunks...\n');

// Función para obtener tamaño de archivo
function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch (error) {
    return 0;
  }
}

// Función para formatear bytes
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Función para obtener compresión gzip estimada
function getGzipSize(filePath) {
  try {
    const gzipCommand = process.platform === 'win32' 
      ? `powershell "Get-Content '${filePath}' | gzip | Measure-Object -Property Length -Sum | Select-Object -ExpandProperty Sum"`
      : `gzip -c "${filePath}" | wc -c`;
    
    const result = execSync(gzipCommand, { encoding: 'utf8' });
    return parseInt(result.trim());
  } catch (error) {
    // Estimación aproximada (30-40% del tamaño original para JS)
    return Math.round(getFileSize(filePath) * 0.35);
  }
}

// Directorio de distribución
const distDir = path.join(__dirname, '../dist/flexoauth-frontend');

if (!fs.existsSync(distDir)) {
  console.log('❌ No se encontró el directorio de distribución.');
  console.log('   Ejecuta "npm run build" primero.\n');
  process.exit(1);
}

// Obtener archivos JS
const jsFiles = fs.readdirSync(distDir)
  .filter(file => file.endsWith('.js') && !file.endsWith('.map'))
  .map(file => {
    const filePath = path.join(distDir, file);
    const size = getFileSize(filePath);
    const gzipSize = getGzipSize(filePath);
    
    // Determinar tipo de chunk
    let chunkType = 'other';
    if (file.includes('main')) chunkType = 'main';
    else if (file.includes('vendor')) chunkType = 'vendor';
    else if (file.includes('runtime')) chunkType = 'runtime';
    else if (file.includes('material')) chunkType = 'material';
    else if (file.includes('usuarios')) chunkType = 'usuarios';
    else if (file.includes('reportes')) chunkType = 'reportes';
    else if (file.includes('auth')) chunkType = 'auth';
    else if (file.includes('common')) chunkType = 'common';
    
    return {
      name: file,
      type: chunkType,
      size: size,
      gzipSize: gzipSize,
      compression: ((size - gzipSize) / size * 100).toFixed(1)
    };
  })
  .sort((a, b) => b.size - a.size);

// Generar reporte
console.log('📊 REPORTE DE CHUNKS\n');
console.log('='.repeat(80));
console.log('| Archivo'.padEnd(35) + '| Tipo'.padEnd(12) + '| Tamaño'.padEnd(12) + '| Gzip'.padEnd(12) + '| Compresión |');
console.log('='.repeat(80));

let totalSize = 0;
let totalGzipSize = 0;

jsFiles.forEach(file => {
  totalSize += file.size;
  totalGzipSize += file.gzipSize;
  
  const name = file.name.length > 32 ? file.name.substring(0, 29) + '...' : file.name;
  const type = file.type;
  const size = formatBytes(file.size);
  const gzipSize = formatBytes(file.gzipSize);
  const compression = file.compression + '%';
  
  console.log(`| ${name.padEnd(33)} | ${type.padEnd(10)} | ${size.padEnd(10)} | ${gzipSize.padEnd(10)} | ${compression.padEnd(9)} |`);
});

console.log('='.repeat(80));
console.log(`| ${'TOTAL'.padEnd(33)} | ${' '.padEnd(10)} | ${formatBytes(totalSize).padEnd(10)} | ${formatBytes(totalGzipSize).padEnd(10)} | ${((totalSize - totalGzipSize) / totalSize * 100).toFixed(1)}%`.padEnd(9) + ' |');
console.log('='.repeat(80));

// Análisis por tipo de chunk
console.log('\n📈 ANÁLISIS POR TIPO DE CHUNK\n');

const chunkTypes = {};
jsFiles.forEach(file => {
  if (!chunkTypes[file.type]) {
    chunkTypes[file.type] = { count: 0, size: 0, gzipSize: 0 };
  }
  chunkTypes[file.type].count++;
  chunkTypes[file.type].size += file.size;
  chunkTypes[file.type].gzipSize += file.gzipSize;
});

Object.entries(chunkTypes)
  .sort(([,a], [,b]) => b.size - a.size)
  .forEach(([type, data]) => {
    console.log(`${type.toUpperCase().padEnd(12)}: ${data.count} archivo(s), ${formatBytes(data.size)} (${formatBytes(data.gzipSize)} gzip)`);
  });

// Recomendaciones
console.log('\n💡 RECOMENDACIONES\n');

const mainChunk = jsFiles.find(f => f.type === 'main');
const vendorChunk = jsFiles.find(f => f.type === 'vendor');

if (mainChunk && mainChunk.size > 250000) {
  console.log('⚠️  El chunk principal es muy grande (>250KB). Considera dividir más el código.');
}

if (vendorChunk && vendorChunk.size > 500000) {
  console.log('⚠️  El chunk de vendors es muy grande (>500KB). Considera lazy loading de librerías.');
}

const lazyChunks = jsFiles.filter(f => !['main', 'vendor', 'runtime'].includes(f.type));
const avgLazySize = lazyChunks.reduce((sum, f) => sum + f.size, 0) / lazyChunks.length;

if (avgLazySize > 100000) {
  console.log('⚠️  Los chunks lazy son grandes en promedio. Considera dividir más los módulos.');
}

const totalInitialSize = jsFiles
  .filter(f => ['main', 'vendor', 'runtime'].includes(f.type))
  .reduce((sum, f) => sum + f.gzipSize, 0);

console.log(`\n📦 Tamaño inicial (gzip): ${formatBytes(totalInitialSize)}`);

if (totalInitialSize < 200000) {
  console.log('✅ Excelente tamaño inicial (<200KB gzip)');
} else if (totalInitialSize < 300000) {
  console.log('✅ Buen tamaño inicial (<300KB gzip)');
} else {
  console.log('⚠️  Tamaño inicial grande. Considera optimizaciones adicionales.');
}

// Generar archivo JSON con los datos
const reportData = {
  timestamp: new Date().toISOString(),
  totalSize: totalSize,
  totalGzipSize: totalGzipSize,
  totalCompression: ((totalSize - totalGzipSize) / totalSize * 100).toFixed(1),
  initialSize: totalInitialSize,
  chunks: jsFiles,
  chunkTypes: chunkTypes
};

const reportPath = path.join(__dirname, '../reports/chunk-report.json');
const reportsDir = path.dirname(reportPath);

if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
console.log(`\n📄 Reporte guardado en: ${reportPath}`);

console.log('\n🚀 Para analizar chunks interactivamente, ejecuta: npm run analyze');
console.log('📊 Para medir rendimiento, ejecuta: npm run performance-test\n');
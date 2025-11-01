const path = require('path');
const webpack = require('webpack');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = (config, options) => {
  // Configuración de optimización de chunks
  config.optimization = {
    ...config.optimization,
    
    // Configurar split chunks para lazy loading optimizado
    splitChunks: {
      chunks: 'all',
      minSize: 20000,
      maxSize: 250000, // 250KB máximo por chunk
      minChunks: 1,
      maxAsyncRequests: 30,
      maxInitialRequests: 30,
      enforceSizeThreshold: 50000,
      
      cacheGroups: {
        // Vendor chunks (librerías de terceros)
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10,
          chunks: 'initial',
          enforce: true
        },
        
        // Angular Material como chunk separado
        material: {
          test: /[\\/]node_modules[\\/]@angular[\\/]material[\\/]/,
          name: 'material',
          priority: 20,
          chunks: 'all',
          enforce: true
        },
        
        // Angular CDK como chunk separado
        cdk: {
          test: /[\\/]node_modules[\\/]@angular[\\/]cdk[\\/]/,
          name: 'cdk',
          priority: 20,
          chunks: 'all',
          enforce: true
        },
        
        // RxJS como chunk separado
        rxjs: {
          test: /[\\/]node_modules[\\/]rxjs[\\/]/,
          name: 'rxjs',
          priority: 20,
          chunks: 'all',
          enforce: true
        },
        
        // Chunk común para código compartido
        common: {
          name: 'common',
          minChunks: 2,
          priority: 5,
          chunks: 'all',
          enforce: true
        },
        
        // Chunks específicos por módulo
        usuarios: {
          test: /[\\/]src[\\/]app[\\/](components|modules)[\\/]usuario/,
          name: 'usuarios',
          priority: 15,
          chunks: 'all'
        },
        
        reportes: {
          test: /[\\/]src[\\/]app[\\/](components|modules)[\\/]reporte/,
          name: 'reportes',
          priority: 15,
          chunks: 'all'
        },
        
        auth: {
          test: /[\\/]src[\\/]app[\\/](components|modules)[\\/]auth/,
          name: 'auth',
          priority: 15,
          chunks: 'all'
        }
      }
    },
    
    // Configurar runtime chunk
    runtimeChunk: {
      name: 'runtime'
    },
    
    // Configurar module concatenation
    concatenateModules: true,
    
    // Configurar side effects
    sideEffects: false
  };

  // Configurar nombres de chunks para mejor debugging
  config.output = {
    ...config.output,
    chunkFilename: options.configuration === 'production' 
      ? '[name].[contenthash:8].chunk.js'
      : '[name].chunk.js'
  };

  // Configurar plugins adicionales
  config.plugins = config.plugins || [];
  
  // Plugin para analizar bundles (solo en desarrollo)
  if (options.configuration === 'development' && process.env.ANALYZE) {
    config.plugins.push(
      new BundleAnalyzerPlugin({
        analyzerMode: 'server',
        analyzerHost: 'localhost',
        analyzerPort: 8888,
        openAnalyzer: true,
        generateStatsFile: true,
        statsFilename: 'bundle-stats.json'
      })
    );
  }

  // Plugin para definir variables de entorno
  config.plugins.push(
    new webpack.DefinePlugin({
      'process.env.CHUNK_LOADING': JSON.stringify(true),
      'process.env.LAZY_LOADING': JSON.stringify(true)
    })
  );

  // Configurar resolve para mejor tree shaking
  config.resolve = {
    ...config.resolve,
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/app/components'),
      '@services': path.resolve(__dirname, 'src/app/services'),
      '@modules': path.resolve(__dirname, 'src/app/modules'),
      '@shared': path.resolve(__dirname, 'src/app/shared')
    }
  };

  // Configurar module rules para optimización
  config.module.rules = config.module.rules || [];
  
  // Regla para lazy loading de imágenes
  config.module.rules.push({
    test: /\.(png|jpe?g|gif|svg)$/i,
    type: 'asset/resource',
    generator: {
      filename: 'assets/images/[name].[hash:8][ext]'
    },
    parser: {
      dataUrlCondition: {
        maxSize: 8 * 1024 // 8KB
      }
    }
  });

  // Configurar performance hints
  config.performance = {
    hints: options.configuration === 'production' ? 'warning' : false,
    maxEntrypointSize: 512000, // 500KB
    maxAssetSize: 250000, // 250KB
    assetFilter: (assetFilename) => {
      return !assetFilename.endsWith('.map');
    }
  };

  // Configurar devtool para mejor debugging
  if (options.configuration === 'development') {
    config.devtool = 'eval-source-map';
  }

  return config;
};

// Configuración adicional para Angular CLI
module.exports.webpackConfig = {
  // Configurar chunk loading timeout
  chunkLoadTimeout: 30000, // 30 segundos
  
  // Configurar public path dinámico
  publicPath: 'auto',
  
  // Configurar cross origin loading
  crossOriginLoading: 'anonymous'
};
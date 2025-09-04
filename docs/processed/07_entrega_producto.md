# 7. Entrega del producto

## 7.1. Configuración de producción

La entrega del producto requiere una configuración específica para entorno de producción que garantice seguridad, rendimiento y estabilidad del sistema en un ambiente real de uso.

### 7.1.1. Configuración del frontend

#### 7.1.1.1. Variables de entorno de producción

```bash
# .env.production
VITE_API_BASE_URL=https://api.tfg-platform.com/api
VITE_APP_NAME=Plataforma de Gestión de TFG
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=production
VITE_ENABLE_ANALYTICS=true
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

#### 7.1.1.2. Optimización del build de producción

```javascript
// vite.config.js - Configuración optimizada para producción
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    react({
      // Enable React Fast Refresh
      fastRefresh: true,
    })
  ],
  build: {
    // Output directory
    outDir: 'dist',
    
    // Generate sourcemaps for debugging
    sourcemap: false, // Disable in production for security
    
    // Minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs
        drop_debugger: true
      }
    },
    
    // Chunk splitting strategy
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk
          vendor: ['react', 'react-dom', 'react-router-dom'],
          // UI components chunk
          ui: ['@headlessui/react', '@heroicons/react'],
          // Calendar chunk
          calendar: ['@fullcalendar/core', '@fullcalendar/react', '@fullcalendar/daygrid'],
          // Utils chunk
          utils: ['axios', 'date-fns', 'lodash']
        }
      }
    },
    
    // Asset optimization
    assetsDir: 'assets',
    assetsInlineLimit: 4096, // 4kb
    
    // Target modern browsers
    target: 'es2020'
  },
  
  // Define constants for production
  define: {
    __DEV__: JSON.stringify(false),
    __VERSION__: JSON.stringify(process.env.npm_package_version)
  },
  
  // Server configuration for preview
  preview: {
    port: 3000,
    host: true
  }
})
```

#### 7.1.1.3. Configuración PWA (Preparación futura)

```javascript
// src/sw.js - Service Worker básico
const CACHE_NAME = 'tfg-platform-v1.0.0';
const STATIC_ASSETS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

// Install event - Cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - Clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => cacheName !== CACHE_NAME)
            .map(cacheName => caches.delete(cacheName))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - Serve cached content when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});
```

### 7.1.2. Configuración del backend

#### 7.1.2.1. Variables de entorno de producción

```bash
# .env.prod
APP_ENV=prod
APP_DEBUG=false
APP_SECRET=your-super-secret-production-key-here

# Database
DATABASE_URL="mysql://tfg_user:secure_password@127.0.0.1:3306/tfg_production?serverVersion=8.0"

# JWT Configuration
JWT_SECRET_KEY=%kernel.project_dir%/config/jwt/private.pem
JWT_PUBLIC_KEY=%kernel.project_dir%/config/jwt/public.pem
JWT_PASSPHRASE=your-jwt-passphrase

# CORS Configuration
CORS_ALLOW_ORIGIN=https://tfg-platform.com

# Mailer
MAILER_DSN=smtp://smtp.gmail.com:587?username=noreply@tfg-platform.com&password=app-password

# File Upload
MAX_FILE_SIZE=52428800
UPLOAD_PATH=/var/www/uploads

# Monitoring
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# Cache
REDIS_URL=redis://127.0.0.1:6379
```

#### 7.1.2.2. Configuración de Symfony para producción

```yaml
# config/packages/prod/framework.yaml
framework:
    cache:
        app: cache.adapter.redis
        default_redis_provider: '%env(REDIS_URL)%'
    
    session:
        handler_id: session.handler.redis
        
    assets:
        # Enable asset versioning
        version_strategy: 'Symfony\Component\Asset\VersionStrategy\JsonManifestVersionStrategy'
    
    http_cache:
        enabled: true
        debug: false

# config/packages/prod/doctrine.yaml
doctrine:
    dbal:
        connections:
            default:
                options:
                    1002: "SET sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''))"
                    
        types:
            # Custom types if needed
            
    orm:
        auto_generate_proxy_classes: false
        metadata_cache_driver:
            type: redis
            host: '%env(REDIS_URL)%'
        query_cache_driver:
            type: redis
            host: '%env(REDIS_URL)%'
        result_cache_driver:
            type: redis
            host: '%env(REDIS_URL)%'

# config/packages/prod/monolog.yaml
monolog:
    handlers:
        main:
            type: rotating_file
            path: '%kernel.logs_dir%/%kernel.environment%.log'
            level: error
            channels: ["!event"]
            max_files: 30
            
        console:
            type: console
            process_psr_3_messages: false
            channels: ["!event", "!doctrine"]
            
        sentry:
            type: sentry
            dsn: '%env(SENTRY_DSN)%'
            level: error
```

#### 7.1.2.3. Optimización de rendimiento

```php
<?php
// config/packages/prod/cache.yaml
framework:
    cache:
        pools:
            # TFG data cache
            tfg.cache:
                adapter: cache.adapter.redis
                default_lifetime: 3600 # 1 hour
                
            # User data cache  
            user.cache:
                adapter: cache.adapter.redis
                default_lifetime: 1800 # 30 minutes
                
            # Notification cache
            notification.cache:
                adapter: cache.adapter.redis
                default_lifetime: 300 # 5 minutes

# Performance optimizations
parameters:
    # Database connection pooling
    database.max_connections: 20
    database.idle_timeout: 300
    
    # File upload optimizations
    file.chunk_size: 1048576 # 1MB chunks
    file.max_concurrent_uploads: 5
```
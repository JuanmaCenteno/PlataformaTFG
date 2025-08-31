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

#### 7.1.1.3. PWA Configuration (Preparación futura)

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

## 7.2. Despliegue con Docker

### 7.2.1. Containerización del frontend

#### 7.2.1.1. Dockerfile multi-stage para React

```dockerfile
# Dockerfile.frontend
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine AS production

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

#### 7.2.1.2. Configuración de Nginx

```nginx
# nginx.conf
server {
    listen 80;
    server_name localhost;
    
    root /usr/share/nginx/html;
    index index.html;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Vary "Accept-Encoding";
    }
    
    # Handle SPA routing
    location / {
        try_files $uri $uri/ /index.html;
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;
        add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.tfg-platform.com;" always;
    }
    
    # API proxy (if needed)
    location /api/ {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS headers
        add_header 'Access-Control-Allow-Origin' 'https://tfg-platform.com' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type, X-Requested-With' always;
    }
}
```

### 7.2.2. Containerización del backend

#### 7.2.2.1. Dockerfile para Symfony

```dockerfile
# Dockerfile.backend
# Base image with PHP 8.2 and required extensions
FROM php:8.2-fpm-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    git \
    unzip \
    libzip-dev \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    mysql-client \
    supervisor \
    nginx

# Install PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        pdo \
        pdo_mysql \
        zip \
        gd \
        opcache

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Production stage
FROM base AS production

# Set working directory
WORKDIR /var/www/html

# Copy composer files
COPY composer*.json ./

# Install PHP dependencies (production only)
RUN composer install --no-dev --optimize-autoloader --no-scripts

# Copy application code
COPY . .

# Set proper permissions
RUN chown -R www-data:www-data /var/www/html \
    && find /var/www/html -type f -exec chmod 644 {} \; \
    && find /var/www/html -type d -exec chmod 755 {} \;

# Create required directories
RUN mkdir -p var/cache var/log public/uploads \
    && chown -R www-data:www-data var public/uploads

# Generate JWT keys
RUN php bin/console lexik:jwt:generate-keypair --skip-if-exists

# Clear and warm up cache
RUN php bin/console cache:clear --env=prod \
    && php bin/console cache:warmup --env=prod

# Copy supervisor configuration
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Copy nginx configuration for Symfony
COPY docker/nginx-symfony.conf /etc/nginx/http.d/default.conf

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD php bin/console debug:container --env=prod || exit 1

# Expose port
EXPOSE 80

# Start supervisor
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
```

#### 7.2.2.2. Configuraciones adicionales

```ini
; docker/supervisord.conf
[supervisord]
nodaemon=true
user=root

[program:nginx]
command=nginx -g "daemon off;"
autostart=true
autorestart=true
stderr_logfile=/var/log/nginx.err.log
stdout_logfile=/var/log/nginx.out.log

[program:php-fpm]
command=php-fpm -F
autostart=true
autorestart=true
stderr_logfile=/var/log/php-fpm.err.log
stdout_logfile=/var/log/php-fpm.out.log

[program:messenger-consume]
command=php bin/console messenger:consume async --time-limit=3600 --memory-limit=128M
autostart=true
autorestart=true
numprocs=2
stderr_logfile=/var/log/messenger.err.log
stdout_logfile=/var/log/messenger.out.log
```

### 7.2.3. Docker Compose para producción

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  # Frontend
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.frontend
      target: production
    container_name: tfg-frontend
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./ssl:/etc/ssl/certs:ro
    restart: unless-stopped
    depends_on:
      - backend
    networks:
      - tfg-network

  # Backend
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.backend
      target: production
    container_name: tfg-backend
    environment:
      - APP_ENV=prod
      - DATABASE_URL=mysql://tfg_user:${DB_PASSWORD}@database:3306/tfg_production
      - REDIS_URL=redis://redis:6379
    volumes:
      - ./backend/public/uploads:/var/www/html/public/uploads
      - ./backend/var/log:/var/www/html/var/log
    restart: unless-stopped
    depends_on:
      - database
      - redis
    networks:
      - tfg-network

  # Database
  database:
    image: mysql:8.0
    container_name: tfg-database
    environment:
      - MYSQL_DATABASE=tfg_production
      - MYSQL_USER=tfg_user
      - MYSQL_PASSWORD=${DB_PASSWORD}
      - MYSQL_ROOT_PASSWORD=${DB_ROOT_PASSWORD}
    volumes:
      - db_data:/var/lib/mysql
      - ./docker/mysql/init:/docker-entrypoint-initdb.d:ro
    ports:
      - "3306:3306"
    restart: unless-stopped
    networks:
      - tfg-network

  # Redis for caching
  redis:
    image: redis:7-alpine
    container_name: tfg-redis
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    restart: unless-stopped
    networks:
      - tfg-network

  # Backup service
  backup:
    image: alpine:latest
    container_name: tfg-backup
    volumes:
      - db_data:/data/db:ro
      - ./backups:/backups
      - ./docker/backup-script.sh:/backup-script.sh:ro
    environment:
      - DB_PASSWORD=${DB_PASSWORD}
    command: sh -c "chmod +x /backup-script.sh && crond -f"
    restart: unless-stopped
    depends_on:
      - database
    networks:
      - tfg-network

volumes:
  db_data:
    driver: local
  redis_data:
    driver: local

networks:
  tfg-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
```

## 7.3. CI/CD Pipeline

### 7.3.1. GitHub Actions workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

env:
  NODE_VERSION: '18'
  PHP_VERSION: '8.2'

jobs:
  # Testing jobs
  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json
          
      - name: Install dependencies
        working-directory: ./frontend
        run: npm ci
        
      - name: Run linting
        working-directory: ./frontend
        run: npm run lint
        
      - name: Run tests
        working-directory: ./frontend
        run: npm run test -- --coverage --watchAll=false
        
      - name: Build application
        working-directory: ./frontend
        run: npm run build

  test-backend:
    runs-on: ubuntu-latest
    
    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: root
          MYSQL_DATABASE: tfg_test
        ports:
          - 3306:3306
        options: >-
          --health-cmd="mysqladmin ping"
          --health-interval=10s
          --health-timeout=5s
          --health-retries=3

    steps:
      - uses: actions/checkout@v4
      
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: ${{ env.PHP_VERSION }}
          extensions: mbstring, xml, ctype, iconv, intl, pdo, pdo_mysql, dom, filter, gd, json, zip
          coverage: xdebug
          
      - name: Cache Composer packages
        uses: actions/cache@v3
        with:
          path: vendor
          key: ${{ runner.os }}-php-${{ hashFiles('**/composer.lock') }}
          restore-keys: ${{ runner.os }}-php-
          
      - name: Install dependencies
        working-directory: ./backend
        run: composer install --prefer-dist --no-progress
        
      - name: Run PHP CS Fixer
        working-directory: ./backend
        run: vendor/bin/php-cs-fixer fix --dry-run --diff
        
      - name: Run PHPStan
        working-directory: ./backend
        run: vendor/bin/phpstan analyse
        
      - name: Setup test database
        working-directory: ./backend
        run: |
          php bin/console doctrine:database:create --env=test
          php bin/console doctrine:migrations:migrate --no-interaction --env=test
          php bin/console doctrine:fixtures:load --no-interaction --env=test
        env:
          DATABASE_URL: mysql://root:root@127.0.0.1:3306/tfg_test
          
      - name: Run tests
        working-directory: ./backend
        run: vendor/bin/phpunit --coverage-clover coverage.xml
        env:
          DATABASE_URL: mysql://root:root@127.0.0.1:3306/tfg_test

  # Security scanning
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-results.sarif'
          
      - name: Upload Trivy scan results
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'

  # Build and deploy
  deploy:
    needs: [test-frontend, test-backend, security-scan]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Docker Buildx
        uses: docker/setup-buildx-action@v3
        
      - name: Login to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
          
      - name: Build and push Frontend image
        uses: docker/build-push-action@v5
        with:
          context: ./frontend
          file: ./frontend/Dockerfile.frontend
          push: true
          tags: ghcr.io/${{ github.repository }}/frontend:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
          
      - name: Build and push Backend image
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          file: ./backend/Dockerfile.backend
          push: true
          tags: ghcr.io/${{ github.repository }}/backend:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Deploy to production server
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.PROD_HOST }}
          username: ${{ secrets.PROD_USER }}
          key: ${{ secrets.PROD_SSH_KEY }}
          script: |
            cd /opt/tfg-platform
            export IMAGE_TAG=${{ github.sha }}
            docker-compose -f docker-compose.prod.yml pull
            docker-compose -f docker-compose.prod.yml up -d
            docker system prune -f
            
      - name: Run database migrations
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.PROD_HOST }}
          username: ${{ secrets.PROD_USER }}
          key: ${{ secrets.PROD_SSH_KEY }}
          script: |
            cd /opt/tfg-platform
            docker-compose -f docker-compose.prod.yml exec -T backend php bin/console doctrine:migrations:migrate --no-interaction
            
      - name: Health check
        run: |
          sleep 30
          curl -f https://tfg-platform.com/health || exit 1
          curl -f https://api.tfg-platform.com/health || exit 1
```

### 7.3.2. Scripts de despliegue

```bash
#!/bin/bash
# scripts/deploy.sh

set -e

echo "🚀 Starting deployment process..."

# Configuration
COMPOSE_FILE="docker-compose.prod.yml"
PROJECT_NAME="tfg-platform"
BACKUP_DIR="/opt/backups/tfg-platform"

# Create backup
echo "📦 Creating backup..."
mkdir -p $BACKUP_DIR/$(date +%Y%m%d_%H%M%S)
docker-compose -f $COMPOSE_FILE exec -T database mysqldump -u root -p$DB_ROOT_PASSWORD tfg_production > $BACKUP_DIR/$(date +%Y%m%d_%H%M%S)/database.sql

# Pull latest images
echo "📥 Pulling latest images..."
docker-compose -f $COMPOSE_FILE pull

# Stop services
echo "⏹️ Stopping services..."
docker-compose -f $COMPOSE_FILE stop

# Start services
echo "▶️ Starting services..."
docker-compose -f $COMPOSE_FILE up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Run database migrations
echo "🗄️ Running database migrations..."
docker-compose -f $COMPOSE_FILE exec -T backend php bin/console doctrine:migrations:migrate --no-interaction

# Clear application cache
echo "🧹 Clearing application cache..."
docker-compose -f $COMPOSE_FILE exec -T backend php bin/console cache:clear --env=prod

# Health check
echo "🏥 Performing health check..."
if curl -f https://tfg-platform.com/health && curl -f https://api.tfg-platform.com/health; then
    echo "✅ Deployment successful!"
else
    echo "❌ Health check failed! Rolling back..."
    docker-compose -f $COMPOSE_FILE down
    # Restore from backup logic here
    exit 1
fi

# Clean up old images
echo "🧹 Cleaning up old images..."
docker system prune -f

echo "🎉 Deployment completed successfully!"
```

## 7.4. Configuración de dominio y SSL

### 7.4.1. Configuración de DNS

```bash
# DNS Records for tfg-platform.com
# A Records
tfg-platform.com.     300  IN  A    192.168.1.100
www.tfg-platform.com. 300  IN  A    192.168.1.100
api.tfg-platform.com. 300  IN  A    192.168.1.100

# CNAME Records
admin.tfg-platform.com. 300 IN CNAME tfg-platform.com.

# MX Records (for email)
tfg-platform.com. 300 IN MX 10 mail.tfg-platform.com.

# TXT Records (SPF, DKIM, DMARC)
tfg-platform.com. 300 IN TXT "v=spf1 include:_spf.google.com ~all"
tfg-platform.com. 300 IN TXT "v=DMARC1; p=quarantine; rua=mailto:dmarc@tfg-platform.com"
```

### 7.4.2. Certificados SSL con Let's Encrypt

```bash
#!/bin/bash
# scripts/setup-ssl.sh

# Install certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Generate certificates
sudo certbot --nginx -d tfg-platform.com -d www.tfg-platform.com -d api.tfg-platform.com

# Auto-renewal cron job
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -

# Test renewal
sudo certbot renew --dry-run
```

### 7.4.3. Nginx configuration con SSL

```nginx
# /etc/nginx/sites-available/tfg-platform
server {
    listen 80;
    server_name tfg-platform.com www.tfg-platform.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tfg-platform.com www.tfg-platform.com;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/tfg-platform.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tfg-platform.com/privkey.pem;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;
    
    # Modern SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # HSTS
    add_header Strict-Transport-Security "max-age=63072000" always;
    
    # Proxy to frontend container
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# API subdomain
server {
    listen 443 ssl http2;
    server_name api.tfg-platform.com;
    
    # SSL Configuration (same as above)
    ssl_certificate /etc/letsencrypt/live/tfg-platform.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tfg-platform.com/privkey.pem;
    
    # Proxy to backend container
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS headers for API
        add_header 'Access-Control-Allow-Origin' 'https://tfg-platform.com' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type, X-Requested-With' always;
    }
}
```

## 7.5. Monitoreo y logs

### 7.5.1. Configuración de Prometheus y Grafana

```yaml
# docker-compose.monitoring.yml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=200h'
      - '--web.enable-lifecycle'
    restart: unless-stopped
    networks:
      - monitoring

  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    ports:
      - "3001:3000"
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/grafana/dashboards:/etc/grafana/provisioning/dashboards:ro
      - ./monitoring/grafana/datasources:/etc/grafana/provisioning/datasources:ro
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD}
      - GF_USERS_ALLOW_SIGN_UP=false
    restart: unless-stopped
    networks:
      - monitoring

volumes:
  prometheus_data:
  grafana_data:

networks:
  monitoring:
    driver: bridge
```

### 7.5.2. Sistema de backup automatizado

```bash
#!/bin/bash
# scripts/backup.sh

# Configuration
BACKUP_DIR="/opt/backups/tfg-platform"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Create backup directory
mkdir -p $BACKUP_DIR/$DATE

# Database backup
echo "Creating database backup..."
docker-compose exec -T database mysqldump -u root -p$DB_ROOT_PASSWORD tfg_production | gzip > $BACKUP_DIR/$DATE/database.sql.gz

# Files backup
echo "Creating files backup..."
tar -czf $BACKUP_DIR/$DATE/uploads.tar.gz -C /opt/tfg-platform/backend/public uploads/

# Configuration backup
echo "Creating configuration backup..."
cp -r /opt/tfg-platform/docker-compose.prod.yml $BACKUP_DIR/$DATE/
cp -r /opt/tfg-platform/.env.prod $BACKUP_DIR/$DATE/

# Upload to cloud storage (optional)
if [ ! -z "$AWS_S3_BUCKET" ]; then
    echo "Uploading to S3..."
    aws s3 sync $BACKUP_DIR/$DATE s3://$AWS_S3_BUCKET/backups/$DATE
fi

# Cleanup old backups
echo "Cleaning up old backups..."
find $BACKUP_DIR -type d -mtime +$RETENTION_DAYS -exec rm -rf {} +

echo "Backup completed: $BACKUP_DIR/$DATE"
```

---

*Fecha de elaboración: 31 de agosto de 2025*  
*Versión: 1.0*  
*Estándar: ISO/IEEE 16326:2009*
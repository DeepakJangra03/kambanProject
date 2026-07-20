FROM php:8.4-fpm

RUN apt-get update && apt-get install -y \
    nginx libsqlite3-dev zip unzip curl \
    && docker-php-ext-install pdo pdo_sqlite \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY . .

RUN composer install --no-dev --no-interaction --optimize-autoloader

# Fix permissions - run everything as root so no permission issues
RUN touch database/database.sqlite \
    && chmod -R 777 storage bootstrap/cache database storage/logs

# Generate APP_KEY at build time
RUN php artisan key:generate --force

# Nginx config
RUN echo 'server { \
    listen 80; \
    root /var/www/html/public; \
    index index.php; \
    location / { try_files $uri $uri/ /index.php?$query_string; } \
    location ~ \.php$ { \
        fastcgi_pass 127.0.0.1:9000; \
        fastcgi_index index.php; \
        include fastcgi_params; \
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name; \
    } \
}' > /etc/nginx/sites-available/default

RUN printf '#!/bin/bash\nchmod -R 777 /var/www/html/storage /var/www/html/bootstrap/cache\nphp artisan migrate --force\nphp-fpm -D\nexec nginx -g "daemon off;"\n' > /start.sh && chmod +x /start.sh

EXPOSE 80
CMD ["/start.sh"]

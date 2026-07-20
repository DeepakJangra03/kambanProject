FROM serversideup/php:8.4-fpm-nginx

# Switch to root to install extensions and configure permissions
USER root

# Install the pdo_pgsql extension required for PostgreSQL
RUN install-php-extensions pdo_pgsql

# Set working directory
WORKDIR /var/www/html

# Copy all application files with proper ownership
COPY --chown=www-data:www-data . .

# Install composer dependencies
RUN composer install --no-dev --no-interaction --no-ansi --no-progress --optimize-autoloader

# Set permissions for storage and bootstrap/cache
RUN chmod -R 775 storage bootstrap/cache

# Switch back to the unprivileged www-data user
USER www-data

# Enable automated Laravel tasks on container startup (migrations, caching, etc.)
ENV AUTORUN_ENABLED=true

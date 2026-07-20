FROM serversideup/php:8.4-fpm-nginx

USER root

# Install sqlite extension
RUN install-php-extensions pdo_sqlite sqlite3

WORKDIR /var/www/html

COPY --chown=www-data:www-data . .

# Install composer dependencies
RUN composer install --no-dev --no-interaction --no-ansi --no-progress --optimize-autoloader

# Create SQLite database file
RUN mkdir -p database && touch database/database.sqlite

# Set permissions
RUN chmod -R 775 storage bootstrap/cache database
RUN chown -R www-data:www-data storage bootstrap/cache database

USER www-data

# Auto-run migrations on startup
ENV AUTORUN_ENABLED=true
ENV DB_CONNECTION=sqlite
ENV DB_DATABASE=/var/www/html/database/database.sqlite

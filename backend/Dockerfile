FROM php:8.3-cli

RUN apt-get update && apt-get install -y \
    git \
    curl \
    libsqlite3-dev \
    zip \
    unzip \
    && docker-php-ext-install pdo_sqlite mbstring exif pcntl bcmath

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www
COPY . .

RUN composer install --no-interaction --optimize-autoloader --no-dev

RUN mkdir -p database && touch database/database.sqlite \
    && chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache /var/www/database \
    && chmod -R 775 /var/www/storage /var/www/bootstrap/cache /var/www/database

CMD php artisan config:clear && php artisan route:clear && php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=${PORT:-10000}
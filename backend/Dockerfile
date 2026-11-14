FROM php:8.3-cli

# Cài đặt thư viện hệ thống và extension SQLite cho Laravel
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libsqlite3-dev \
    zip \
    unzip \
    && docker-php-ext-install pdo_sqlite mbstring exif pcntl bcmath gd

# Cài Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www
COPY . .

# Cài đặt thư viện PHP
RUN composer install --no-interaction --optimize-autoloader --no-dev

# Tạo sẵn file database SQLite nếu chưa có và cấp quyền ghi
RUN mkdir -p database && touch database/database.sqlite \
    && chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache /var/www/database \
    && chmod -R 775 /var/www/storage /var/www/bootstrap/cache /var/www/database

# Chạy migrate tạo bảng và khởi động server đúng cổng Render cấp
CMD php artisan config:clear && php artisan route:clear && php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=${PORT:-10000}
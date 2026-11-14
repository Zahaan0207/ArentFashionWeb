FROM php:8.3-cli

# Cài đặt các gói hệ thống và extension thiết yếu cho Laravel + SQLite
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libsqlite3-dev \
    zip \
    unzip \
    && docker-php-ext-install pdo_sqlite mbstring exif pcntl bcmath

# Cài đặt Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www
COPY . .

# Cài đặt thư viện PHP (tối ưu production)
RUN composer install --no-interaction --optimize-autoloader --no-dev

# Tạo database SQLite và phân quyền đầy đủ
RUN mkdir -p database && touch database/database.sqlite \
    && chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache /var/www/database \
    && chmod -R 775 /var/www/storage /var/www/bootstrap/cache /var/www/database

# Chạy migrate tạo bảng tự động và khởi động server đúng cổng Render
CMD php artisan config:clear && php artisan route:clear && php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=${PORT:-10000}
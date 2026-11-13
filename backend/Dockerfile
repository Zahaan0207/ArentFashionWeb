FROM php:8.2-fpm

# Cài đặt các gói hệ thống và PHP extensions cần thiết cho Laravel
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    nginx \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Cấy Composer chính thức vào container
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Thiết lập thư mục làm việc
WORKDIR /var/www

# Copy toàn bộ mã nguồn vào container
COPY . .

# Cấp quyền cho thư mục storage và bootstrap/cache
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

# Cài đặt các gói phụ thuộc bằng Composer
RUN composer install --no-interaction --optimize-autoloader --no-dev

# Cấu hình Nginx trỏ vào thư mục public của Laravel
RUN echo 'server {\n\
    listen 10000;\n\
    root /var/www/public;\n\
    add_header X-Frame-Options "SAMEORIGIN";\n\
    add_header X-Content-Type-Options "nosniff";\n\
    index index.php;\n\
    charset utf-8;\n\
    location / {\n\
        try_files $uri $uri/ /index.php?$query_string;\n\
    }\n\
    location ~ \.php$ {\n\
        fastcgi_pass 127.0.0.1:9000;\n\
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;\n\
        include fastcgi_params;\n\
    }\n\
    location ~ /\.(?!well-known).* {\n\
        deny all;\n\
    }\n\
}' > /etc/nginx/sites-available/default

EXPOSE 10000

# Chạy đồng thời PHP-FPM và Nginx thông qua script khởi động
CMD service nginx start && php-fpm
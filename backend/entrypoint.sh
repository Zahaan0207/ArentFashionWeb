#!/bin/sh
# Khởi động PHP-FPM ở chế độ nền (background)
php-fpm -D

# Khởi động Nginx ở chế độ foreground để giữ container luôn chạy
nginx -g "daemon off;"
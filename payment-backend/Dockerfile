FROM php:8.2-apache

# Install system dependencies
RUN apt-get update && apt-get install -y git unzip \
    && rm -rf /var/lib/apt/lists/*

# Enable Apache mod_rewrite
RUN a2enmod rewrite

# Copy application files
COPY public/ /var/www/html/
COPY .env /var/www/html/
COPY firebase-service-account.json /var/www/html/

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
WORKDIR /var/www/html
RUN composer install --no-dev --optimize-autoloader

EXPOSE 8080
CMD ["apache2-foreground"] 
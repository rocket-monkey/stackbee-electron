FROM nextcloud
MAINTAINER Remo Vetere <remo.vetere@gmail.com>

# Install wget
RUN apt-get update && \
    apt-get install -y wget && \
    apt-get install -y mysql-client && \
    apt-get install -y inotify-tools && \
    apt-get install -y libnotify-bin && \
    apt-get install -y smbclient && \
    apt-get install -y sendmail && \
    apt-get install -y sudo

RUN a2enmod headers

COPY apache2.conf /etc/apache2/apache2.conf
COPY defaultConfig.json /var/www/defaultConfig.json
RUN chown -R www-data:www-data /var/www/defaultConfig.json

COPY bootstrap.php /var/www/bootstrap.php
RUN chown -R www-data:www-data /var/www/bootstrap.php
RUN chmod +x /var/www/bootstrap.php

# Relocate the timezone file
# RUN mkdir -p /config/etc && mv /etc/timezone /config/etc/ && ln -s /config/etc/timezone /etc/

# Set the time zone
# RUN echo "Europe/London" > /config/etc/timezone

# Create the data folder if not exists
RUN mkdir -p /efs/data
RUN mkdir -p /efs/custom_apps
RUN mkdir -p /efs/theming

# WORKDIR /root
# ADD .aws/credentials /root/.aws/

# ADD ntp.conf /etc/

COPY docker-entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

COPY on-config-create.sh /on-config-create.sh
RUN chmod +x /on-config-create.sh

COPY modify-config.sh /modify-config.sh
RUN chmod +x /modify-config.sh

COPY max-execution-time.ini /usr/local/etc/php/conf.d/max-execution-time.ini

ENTRYPOINT ["/entrypoint.sh"]
CMD ["apache2-foreground"]

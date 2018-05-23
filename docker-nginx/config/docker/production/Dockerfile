FROM nginx:alpine

RUN apk update && \
    apk add openssl

# We don't need the default config
# RUN rm -f /etc/nginx/conf.d/default.conf

COPY reloadProxy /etc/periodic/15min/reloadProxy
RUN chmod +x /etc/periodic/15min/reloadProxy
RUN touch /var/log/cron.log

# On Openshift we need write access for the root group
RUN chgrp root /var/cache/nginx/ /var/run/ /etc/nginx/conf.d/
RUN chmod g+rw -R /var/cache/nginx/ /var/run/ /etc/nginx/conf.d/

# Copying our proxy config into the nginx folder
COPY nginx.conf /etc/nginx/
COPY default.conf /etc/nginx/conf.d/
COPY proxy_vars.conf /etc/nginx/conf.d/

COPY .cert/STAR_stackbee_cloud.ca-bundle /root/.cert/
COPY .cert/STAR_stackbee_cloud.crt /root/.cert/
COPY .cert/stackbee.cloud.key /etc/ssl/

RUN mkdir -p /etc/nginx/ssl.crt/
RUN openssl dhparam -out /etc/nginx/ssl.crt/dhparam.pem 2048

RUN chmod 600 /etc/nginx/ssl.crt/dhparam.pem

RUN cat /root/.cert/STAR_stackbee_cloud.crt /root/.cert/STAR_stackbee_cloud.ca-bundle >> /etc/ssl/cert_chain.crt

# Changing the default command for handling the template
# CMD envsubst '\$NGINX_PROXY_PASS' < /etc/nginx/conf.d/proxy.template > /etc/nginx/conf.d/proxy.conf && nginx -g 'daemon off;'
CMD wget http://node.stackbee.cloud/api/nginx/proxy.conf?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiYWRtaW4iLCJlbWFpbCI6ImFkbWluQHN0YWNrYmVlLmlvIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNDk3NjQ0MTgyfQ.vBpRonrwXE2EU96NUWJT0nA9eTCpBlyjn678fAgNOO8 -O /etc/nginx/conf.d/proxy.conf && \
    nginx -g 'daemon off;'

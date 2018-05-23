# hgo-docker-nginx
dedicated repo for the stackbee.io "nginx" docker image

## followed by this guide
[https://github.com/hopsoft/relay/wiki/How-to-Deploy-Docker-apps-to-Elastic-Beanstalk]()

and [https://wiki.alpinelinux.org/wiki/Nginx_as_reverse_proxy_with_acme_(letsencrypt)]()

```
# docker build -t stackbeeio/nginx config/docker/production

# docker push stackbeeio/nginx

# docker run -d -p 80:80 stackbeeio/nginx:latest
```

## update proxy.conf and reload nginx

```
# wget http://node.stackbee.cloud/api/nginx/proxy.conf?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiYWRtaW4iLCJlbWFpbCI6ImFkbWluQHN0YWNrYmVlLmlvIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNDk3NjQ0MTgyfQ.vBpRonrwXE2EU96NUWJT0nA9eTCpBlyjn678fAgNOO8 -O /etc/nginx/conf.d/proxy.conf && /usr/sbin/nginx -s reload
```
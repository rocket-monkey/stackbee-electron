# hgo-docker-nextcloud
dedicated repo for the stackbee.io "nextcloud" docker image

https://hub.docker.com/r/stackbeeio/nextcloud/

## followed by this guide
[https://github.com/hopsoft/relay/wiki/How-to-Deploy-Docker-apps-to-Elastic-Beanstalk]()

```
# docker build -t stackbeeio/nextcloud config/docker/production

# docker push stackbeeio/nextcloud

# docker run -d -p 80:80 stackbeeio/nextcloud:latest

# docker run -e CUSTOMER_DOMAIN=demo -e DB_NAME=sb_demo_owncloud -e DB_USER=sb_demo_owncloud_admin -e DB_PASS=75w2ke29 -e DB_HOST=sb-maria-owncloud-prod.cfwyrgfxdbjd.eu-west-1.rds.amazonaws.com -p 80:80 stackbeeio/nextcloud:latest

# docker run -d -e CUSTOMER_DOMAIN=demo -e DB_NAME=sb_demo_owncloud -e DB_USER=sb_demo_owncloud_admin -e DB_PASS=75w2ke29 -e DB_HOST=sb-maria-owncloud-prod.cfwyrgfxdbjd.eu-west-1.rds.amazonaws.com -p 80:80 stackbeeio/nextcloud:latest
```
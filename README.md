# hgo-manager
Scripts and Express endpoints for the managing server of stackbee.io, based on node.js

```
# docker build -t stackbeeio/node-manager .

# docker push stackbeeio/node-manager

# docker run -d -p 80:3000 stackbeeio/node-manager:latest
```

## Setup CloudFormation templates

1. create stack "owncloud-deps" by running `sbm ecs create name=owncloud-deps`

2. attach new created VPC (check in outputs of cloud-formation "owncloud-deps") to EFS file-system

3. change security group of RDS to new created owncloud instances SecurityGroup

4. create stack "owncloud" by running `sbm ecs create name=owncloud`

5. create stack "nodejs" by running `sbm ecs create name=nodejs`

6. create stack "nginx" by running `sbm ecs create name=nginx`

7. map Route 53 domain "*.stackbee.cloud" to the correct load-balancer of "nginx"

8. map Route 53 domain "node.stackbee.cloud" to the correct load-balancer of "nodejs"

9. map Route 53 domain "stackbee.cloud" to the correct load-balancer of "owncloud"

## API endpoints

### <hgo-manager-domain>/api/nginx/conf
`Returns the "proxy.conf" configuration file for our nginx owncloud redirect solution`

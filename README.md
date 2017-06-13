# hgo-manager
Scripts and Express endpoints for the managing server of stackbee.io, based on node.js

```
# docker build -t stackbeeio/node-manager .

# docker push stackbeeio/node-manager

# docker run -d -p 80:3000 stackbeeio/node-manager:latest
```

## API endpoints

### <hgo-manager-domain>/api/nginx/conf
`Returns the "proxy.conf" configuration file for our nginx owncloud redirect solution`

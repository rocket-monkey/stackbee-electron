import User from '../../../../shared/db/schema/user';

export const nginxProxyConf = (req, res, next) => {
  if (req.decoded.email !== 'admin@stackbee.io') {
    return res.status(403).send({
        success: false,
        message: 'Only stackbee.io admin can access this route!'
    });
  }

  User.find({ 'modules': { $in: ['owncloud'] }}, (error, users) => {
    let nginxConf = '';
    users.forEach((user) => {
      const owncloudMeta = user.owncloudMeta || {};
      let route;
      Object
        .keys(owncloudMeta)
        .forEach((key) => {
          if (key === 'route') {
            route = owncloudMeta[key];
          }
        });
      if (owncloudMeta.length === 0 || !route) {
        return console.log(`user without route found! update "${user.name}" accordingly!`.red);
      }

      nginxConf += `
server {
  listen                80;
  server_name           ${user.domain}.stackbee.cloud;
  return                301 https://$server_name$request_uri;
}
server {
  listen                443 ssl;
  ssl                   on;
  ssl_certificate       /etc/ssl/cert_chain.crt;
  ssl_certificate_key   /etc/ssl/stackbee.cloud.key;

  server_name           ${user.domain}.stackbee.cloud;

  location / {
    proxy_pass http://${route};
    include /etc/nginx/conf.d/proxy_vars.conf;
  }
}

      `;
    });

    res.send(nginxConf);
  });
};

export const owncloudAutoconfig = (req, res, next) => {
  if (req.decoded.email !== 'admin@stackbee.io') {
    return res.status(403).send({
        success: false,
        message: 'Only stackbee.io admin can access this route!'
    });
  }

  const domain = req.params.domain;
  User.findOne({ domain }, (err, user) => {
    if (err) { return console.log('Could not load user!', err); }
    const content = `<?php
$AUTOCONFIG = array(
  "dbtype"        => "mysql",
  "dbname"        => "${user.owncloudMeta.dbName}",
  "dbuser"        => "${user.owncloudMeta.dbUser}",
  "dbpass"        => "${user.owncloudMeta.dbPassword}",
  "dbhost"        => "${user.owncloudMeta.dbHost}",
  "dbtableprefix" => "oc_",
  "adminlogin"    => "admin",
  "adminpass"     => "${user.owncloudMeta.adminPass}",
  "directory"     => "/efs/data"
);
  `;
    res.send(content);
  });
};

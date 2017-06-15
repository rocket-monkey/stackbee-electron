import User from '../../../shared/db/schema/user';

export const nginxProxyConf = (req, res, next) => {
  User.find({ 'modules': { $in: ['owncloud'] }}, (error, users) => {
    let nginxConf = '';
    users.forEach((user) => {
      const owncloudMeta = user.owncloudMeta || {};
      let owncloudRoute;
      Object
        .keys(owncloudMeta)
        .forEach((key) => {
          if (key === 'owncloudRoute') {
            owncloudRoute = owncloudMeta[key];
          }
        });
      if (owncloudMeta.length === 0 || !owncloudRoute) {
        return console.log(`user without owncloudRoute found! update "${user.name}" accordingly!`.red);
      }

      nginxConf += `
server {
  listen                443 ssl;
  ssl                   on;
  ssl_certificate       /etc/ssl/cert_chain.crt;
  ssl_certificate_key   /etc/ssl/stackbee.cloud.key;

  server_name           ${user.domain}.stackbee.cloud;

  location / {
    proxy_pass http://${owncloudRoute};
    include /etc/nginx/conf.d/proxy_vars.conf;
  }
}

      `;
    });

    res.send(nginxConf);
  });
};

export const owncloudAutoconfig = (req, res, next) => {
  const domain = req.params.domain;
  User.findOne({ domain }, (err, user) => {
    if (err) { return console.log('Could not load user!', err); }
    const content = `<?php
$AUTOCONFIG = array(
  "dbtype"        => "mysql",
  "dbname"        => "${user.owncloudMeta.owncloudDbName}",
  "dbuser"        => "${user.owncloudMeta.owncloudDbUser}",
  "dbpass"        => "${user.owncloudMeta.owncloudDbPassword}",
  "dbhost"        => "${user.owncloudMeta.owncloudDbHost}",
  "dbtableprefix" => "oc_",
  "directory"     => "/efs/data",
);
  `;
    res.send(content);
  });
};

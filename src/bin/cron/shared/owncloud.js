
import fs from 'fs';
import colors from 'colors';
import mongoose from 'mongoose';
import { connectDb } from '../../shared/utils';
import User from '../../shared/schema/user';
import {
  exec,
  createTaskDef,
  waitForTaskRun,
  addSlashes,
} from '../../shared/utils';
import {
  OWNCLOUD_CLUSTER_NAME,
  OWNCLOUD_SECURITY_GROUP_ID,
  OWNCLOUD_LOAD_BALANCER_NAME,
  OWNCLOUD_SSL_CERT_ID,
} from '../../shared/constants';

const writeConfigFileS3 = (user, domain) => {
  const content = `<?php
$AUTOCONFIG = array(
  "dbtype"        => "mysql",
  "dbname"        => "${user.owncloudDbName}",
  "dbuser"        => "${user.owncloudDbUser}",
  "dbpass"        => "${user.owncloudDbPassword}",
  "dbhost"        => "${user.owncloudDbHost}",
  "dbtableprefix" => "oc_",
  "directory"     => "/efs/data",
);
  `;

  fs.writeFile(`./s3_config/${domain}.config.php`, content, (err) => {
    if (err) {
      return console.log(err);
    }

    const res = exec(
      `aws s3 cp --region eu-west-1 ./s3_config/${domain}.config.php s3://sb-owncloud-config/${domain}.config.php`
    );
    console.log(res);

    console.log('Config file saved!'.green);
  });
};

export const processNewOcUsers = (users, callback) => {
  connectDb();
  // TODO: and check if the user actually has the owncloud module!
  User.find({ 'ecsOwncloudServiceArn': { $exists: false } }, (error, users) => {
    processUsers(users, () => {
      mongoose.connection.close();
    });

  });
};

const processUsers = (users, callback) => {

  // get a listing of all current clusters
  let clusterArns;
  const listClusterStr = exec('aws ecs list-clusters');
  if (listClusterStr && typeof listClusterStr === 'string') {
    const listClusterJson = JSON.parse(listClusterStr);
    clusterArns = listClusterJson.clusterArns;
  }

  let servicesArns;
  const listServicesStr = exec(`aws ecs list-services --cluster ${OWNCLOUD_CLUSTER_NAME}`);
  if (listServicesStr && typeof listServicesStr === 'string') {
    const listServicesJson = JSON.parse(listServicesStr);
    servicesArns = listServicesJson.serviceArns;
  }

  const customerExistsInServices = (customer) => {
    for (let i = 0, len = servicesArns.length; i < len; i += 1) {
      if (servicesArns[i].includes(customer, 1)) {
        return servicesArns[i];
      }
    }

    return false;
  }

  // iterate over all new users
  console.log(`Processing ${users.length} new users..`.blue);

  if (users.length === 0) {
    return callback();
  }

  users.forEach((user) => {
    const customer = user.name;
    const customerService = customerExistsInServices(customer);
    if (customerService === false) {

      const domain = createTaskDef(user);
      if (domain) {

        // create new database on RDS for this new owncloud installation
        const mysqlUser = 'sbmaria';
        const mysqlPw = 'iqk2fJAKY744';
        const host = 'sb-maria-prod.cfwyrgfxdbjd.eu-west-1.rds.amazonaws.com';
        const dbName = `sb_${domain.replace(/-/i, '_')}_owncloud`;
        const dbUser = `${dbName}_admin`;
        const dbPassword = Math.random().toString(36).slice(-8);
        exec(
          `mysql -u ${mysqlUser} -h ${host} -p${mysqlPw} -e "CREATE DATABASE IF NOT EXISTS ${dbName} CHARACTER SET utf8 COLLATE utf8_general_ci;"`
        );
        try {
          exec(
            `mysql -u ${mysqlUser} -h ${host} -p${mysqlPw} -e "DROP USER ${dbUser}@'%'"`
          );
        } catch (e) {
          // ignore
        }
        exec(
          `mysql -u ${mysqlUser} -h ${host} -p${mysqlPw} -e "CREATE USER ${dbUser}@'%' IDENTIFIED BY '${dbPassword}'"`
        );
        exec(
          `mysql -u ${mysqlUser} -h ${host} -p${mysqlPw} -e "GRANT SELECT, INSERT, UPDATE, CREATE, DELETE ON ${dbName}.* TO '${dbUser}'@'%'"`
        );
        console.log(`new database name: ${dbName}, user: ${dbUser} 👊`.green);

        user.owncloudDbName = dbName;
        user.owncloudDbUser = dbUser;
        user.owncloudDbPassword = dbPassword;

        // create new service in this cluster
        const serviceRes = JSON.parse(exec(
          `aws ecs create-service --cluster ${OWNCLOUD_CLUSTER_NAME} --service-name ${customer}-owncloud --task-definition ${customer}-owncloud --desired-count 1`
        ));

        if (serviceRes.service.status === 'ACTIVE') {
          console.log(`service "sb-${customer}-owncloud" successfully created! 🚚`.green);
          user.ecsOwncloudServiceArn = serviceRes.service.serviceArn;

          // run new task in this service
          try {
            exec(`aws ecs run-task --cluster ${OWNCLOUD_CLUSTER_NAME} --task-definition ${customer}-owncloud --group service:${customer}-owncloud`);
          } catch (e) {
            // ignore
          }

          setTimeout(() => {
            const taskListRes = JSON.parse(exec(`aws ecs list-tasks --cluster ${OWNCLOUD_CLUSTER_NAME} --service ${customer}-owncloud`));
            taskListRes.taskArns.forEach((taskArn) => {
              waitForTaskRun(OWNCLOUD_CLUSTER_NAME, taskArn, (describeTaskRes) => {
                console.log('task successfully started! 🎉'.green);

                // update EC2 security-group and load-balancer to enable access for the new port on "stackbee.cloud"
                exec(`aws ec2 authorize-security-group-ingress --group-id ${OWNCLOUD_SECURITY_GROUP_ID} --protocol tcp --port ${user.owncloudPort} --cidr 0.0.0.0/0`);

                try {
                  const listeners = [
                    {
                      "Protocol": "HTTPS",
                      "LoadBalancerPort": user.owncloudPort,
                      "InstanceProtocol": "HTTP",
                      "InstancePort": user.owncloudPort,
                      "SSLCertificateId": OWNCLOUD_SSL_CERT_ID
                    }
                  ];
                  exec(`aws elb create-load-balancer-listeners --load-balancer-name ${OWNCLOUD_LOAD_BALANCER_NAME} --listeners "${addSlashes(JSON.stringify(listeners))}"`);
                } catch (e) {
                  // ignore
                }

                user.save((err, user) => {
                  if (err) { return console.log('Could not save user!', err); }
                  console.log(`User updated with serviceArn "${user.ecsOwncloudServiceArn}"`.green);
                  callback();
                });

              });
            });

          }, 8000);
        } else {
          console.log('❗️ could not create service in the cluster ❗️'.red);
          callback();
        }
      } else {
        callback();
      }
    } else {
      user.ecsOwncloudServiceArn = customerService;
      user.save((err, user) => {
        if (err) { return console.log('Could not save user!', err); }
        console.log(`User updated with serviceArn "${customerService}"`.green);
      });
      callback();
    }
  });
};

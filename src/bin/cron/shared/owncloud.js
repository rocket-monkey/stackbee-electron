
import fs from 'fs';
import colors from 'colors';
import mongoose from 'mongoose';
import { connectDb } from '../../../shared/db';
import User from '../../../shared/db/schema/user';
import {
  exec,
  createTaskDef,
  waitForTaskRun,
  addSlashes,
} from '../../../shared/utils';
import {
  OWNCLOUD_CLUSTER_NAME,
  OWNCLOUD_SECURITY_GROUP_ID,
  OWNCLOUD_LOAD_BALANCER_NAME,
  OWNCLOUD_SSL_CERT_ID,
} from '../../../shared/constants';

export const processNewOcUsers = (users, callback) => {
  connectDb();
  User.find({ 'modules': { $in: ['owncloud'] }, 'owncloudMeta.serviceArn': { $exists: false } }, (error, users) => {
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
    const domain = user.domain;
    const customerService = customerExistsInServices(customer);
    if (customerService === false) {

      // create new database on RDS for this new owncloud installation
      const mysqlUser = 'sbmaria';
      const mysqlPw = 'iqk2fJAKY744';
      const host = 'sb-maria-prod.cfwyrgfxdbjd.eu-west-1.rds.amazonaws.com';
      const dbName = `sb_${domain.replace(/-/i, '_')}_owncloud`;
      const dbUser = `${dbName}_admin`;
      const dbPassword = user.owncloudMeta.dbPassword || Math.random().toString(36).slice(-8);
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

      user.owncloudMeta.dbName = dbName;
      user.owncloudMeta.dbUser = dbUser;
      user.owncloudMeta.dbPassword = dbPassword;

      if (createTaskDef(user)) {

        // create new service in this cluster
        const serviceRes = JSON.parse(exec(
          `aws ecs create-service --cluster ${OWNCLOUD_CLUSTER_NAME} --service-name ${customer}-owncloud --task-definition ${customer}-owncloud --desired-count 1`
        ));

        if (serviceRes.service.status === 'ACTIVE') {
          console.log(`service "sb-${customer}-owncloud" successfully created! 🚚`.green);
          user.owncloudMeta.serviceArn = serviceRes.service.serviceArn;

          user.markModified('owncloudMeta');
          user.save((err, user) => {
            if (err) { return console.log('Could not save user!', err); }
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
                  const containerInstancesRes = JSON.parse(exec(
                    `aws ecs describe-container-instances --cluster ${OWNCLOUD_CLUSTER_NAME} --container-instances ${describeTaskRes.containerInstanceArn}`
                  ));
                  const containerInstance = containerInstancesRes.containerInstances.pop();
                  const ec2InstanceRes = JSON.parse(exec(
                    `aws ec2 describe-instances --instance-ids ${containerInstance.ec2InstanceId}`
                  ));
                  const reservations = ec2InstanceRes.Reservations.pop();
                  const instance = reservations.Instances.pop();
                  user.owncloudMeta.route = `${instance.PublicIpAddress}:${user.owncloudMeta.port}`;

                  console.log('task successfully started! 🎉'.green);

                  // update EC2 security-group and load-balancer to enable access for the new port on "stackbee.cloud"
                  try {
                    exec(`aws ec2 authorize-security-group-ingress --group-id ${OWNCLOUD_SECURITY_GROUP_ID} --protocol tcp --port ${user.owncloudMeta.port} --cidr 0.0.0.0/0`);
                  } catch (e) {
                    // ignore
                  }

                  try {

                    const listeners = [
                      {
                        "Protocol": "HTTPS",
                        "LoadBalancerPort": user.owncloudMeta.port,
                        "InstanceProtocol": "HTTP",
                        "InstancePort": user.owncloudMeta.port,
                        "SSLCertificateId": OWNCLOUD_SSL_CERT_ID
                      }
                    ];
                    exec(`aws elb create-load-balancer-listeners --load-balancer-name ${OWNCLOUD_LOAD_BALANCER_NAME} --listeners "${addSlashes(JSON.stringify(listeners))}"`);
                  } catch (e) {
                    // ignore
                  }

                  user.markModified('owncloudMeta');
                  user.save((err, user) => {
                    if (err) { return console.log('Could not save user!', err); }
                    console.log(user);
                    console.log(`User updated with serviceArn "${user.owncloudMeta.serviceArn}"`.green);
                    callback();
                  });

                });
              });

            }, 8000);
          });
          // TODO: place a message-queue notification to update all the nginx proxy.conf's on all running nginx containers
        } else {
          console.log('❗️ could not create service in the cluster ❗️'.red);
          callback();
        }
      } else {
        callback();
      }
    } else {
      user.owncloudMeta.serviceArn = customerService;
      user.save((err, user) => {
        if (err) { return console.log('Could not save user!', err); }
        console.log(`User updated with serviceArn "${customerService}"`.green);
      });
      callback();
    }
  });
};


import fs from 'fs';
import colors from 'colors';
import mongoose from 'mongoose';
import aws from 'aws-sdk';
import { connectDb } from '../../../shared/db';
import User from '../../../shared/db/schema/user';

import {
  exec,
  addSlashes,
} from '../../../shared/utils';

import {
  createTaskDef,
  waitForTaskRun,
} from './utils';

import {
  RDS_PROD_DATABASE,
  OWNCLOUD_CLUSTER_NAME,
  OWNCLOUD_SECURITY_GROUP_ID,
  OWNCLOUD_LOAD_BALANCER_NAME,
  OWNCLOUD_SSL_CERT_ID,
} from '../../../shared/constants';

import awsConfig from '../../../shared/awsCredentials';

aws.config.update(awsConfig);

const ecs = new aws.ECS();
const ec2 = new aws.EC2();
const elb = new aws.ELB();
const cwe = new aws.CloudWatchEvents();

export const updateTaskDefinition = (domain) => {
  connectDb();

  // find the user
  User.findOne({
    domain,
  }, (err, user) => {

    if (err) throw err;

    createTaskDef(user, ecs, (taskDefResult) => {
      if (taskDefResult) {
        mongoose.connection.close();
        return
      }

      console.log('could not update task definition! 😖'.red);
      mongoose.connection.close();
    });

  });
};

export const processNewOcUsers = (users, callback) => {
  connectDb();
  User.find({ 'modules': { $in: ['owncloud'] }, 'owncloudMeta.serviceArn': { $exists: false } }, (error, users) => {
    processUsers(users, () => {
      mongoose.connection.close();
    });

  });
};

const processUsers = (users, callback) => {

  let servicesArns;
  const customerExistsInServices = (customer) => {
    for (let i = 0, len = servicesArns.length; i < len; i += 1) {
      if (servicesArns[i].includes(customer, 1)) {
        return servicesArns[i];
      }
    }

    return false;
  }

  // get a listing of all current clusters
  ecs.listServices({ cluster: OWNCLOUD_CLUSTER_NAME }, (err, data) => {
    if (err) return console.log(err, err.stack); // an error occurred

    servicesArns = data.serviceArns;

    // iterate over all new users
    console.log(`Processing ${users.length} new users..`.blue);

    if (users.length === 0) {
      return callback();
    }

    users.forEach((user, index) => {
      const customer = user.name;
      const domain = user.domain;
      const customerService = customerExistsInServices(customer);
      console.log('still got customerService?:', customerService);
      const isLastUser = users.length - 1 === index;
      if (customerService === false) {

        // create new database on RDS for this new owncloud installation
        const mysqlUser = 'sbmaria';
        const mysqlPw = 'iqk2fJAKY744';
        const host = RDS_PROD_DATABASE;
        const dbName = `sb_${domain.replace(/-/i, '_')}_owncloud`;
        const dbUser = `${dbName}_admin`;
        const dbPassword = user.owncloudMeta.dbPassword || Math.random().toString(36).slice(-8);
        exec(
          `mysql -u ${mysqlUser} -h ${host} -p${mysqlPw} -e "CREATE DATABASE IF NOT EXISTS ${dbName} CHARACTER SET utf8 COLLATE utf8_general_ci;"`
        );
        try {
          exec(
            `mysql -u ${mysqlUser} -h ${host} -p${mysqlPw} -e "DROP USER ${dbUser}@'%'" > /dev/null 2>&1`
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

        createTaskDef(user, ecs, (taskDefResult) => {
          if (taskDefResult) {

            // create new service in this cluster
            ecs.createService({ taskDefinition: OWNCLOUD_CLUSTER_NAME, serviceName: `${customer}-owncloud`, desiredCount: 1 }, (err, data) => {
              if (err) return console.log(err, err.stack); // an error occurred

              if (data.service.status === 'ACTIVE') {
                console.log(`service "sb-${customer}-owncloud" successfully created! 🚚`.green);
                user.owncloudMeta.serviceArn = serviceRes.service.serviceArn;

                user.markModified('owncloudMeta');
                user.save((err, user) => {
                  if (err) { return console.log('Could not save user!', err); }

                  // run new task in this service
                  ecs.runTask(params, (err, data) => {
                    if (err) return console.log(err, err.stack); // an error occurred

                    ec2.authorizeSecurityGroupIngress({
                      groupId: OWNCLOUD_SECURITY_GROUP_ID,
                      protocol: 'tcp',
                      port: user.owncloudMeta.port,
                      cidr: '0.0.0.0/0'
                    }, (err, data) => {
                      if (err) return console.log(err, err.stack); // an error occurred

                      const params = {
                        Listeners: [
                          {
                          Protocol: "HTTPS",
                          LoadBalancerPort: user.owncloudMeta.port,
                          InstancePort: user.owncloudMeta.port,
                          InstanceProtocol: "HTTP",
                          SSLCertificateId: OWNCLOUD_SSL_CERT_ID,
                        }
                        ],
                        LoadBalancerName: OWNCLOUD_LOAD_BALANCER_NAME
                      };
                      elb.createLoadBalancerListeners(params, (err, data) => {
                        if (err) return console.log(err, err.stack); // an error occurred

                        console.log('try to wait for task start..'.blue);

                        setTimeout(() => {
                          ecs.listTasks({ cluster: OWNCLOUD_CLUSTER_NAME, serviceName: `${customer}-owncloud` }, (err, data) => {
                            if (err) return console.log(err, err.stack); // an error occurred

                            if (data.taskArns.length === 0) {
                              console.log('could not start task! mostly because no machine is available anymore!'.red);

                              const params = {
                                Entries: {
                                  Detail: {
                                    clusterName: OWNCLOUD_CLUSTER_NAME,
                                    serviceName: `${customer}-owncloud`,
                                    comparisonOperator: '++',
                                  },
                                  DetailType: 'oc-task-not-starting',
                                  Resources: [`${customer}-owncloud`, OWNCLOUD_CLUSTER_NAME],
                                  Source: 'io.stackbee.owncloud',
                                  Time: new Date || 'Wed Dec 31 1969 16:00:00 GMT-0800 (PST)' || 123456789
                                },
                              };
                              cwe.putEvents(params, (err, data) => {
                                if (err) return console.log(err, err.stack); // an error occurred

                                if (isLastUser) callback();
                              });
                              return;
                            }

                            data.taskArns.forEach((taskArn) => {
                              waitForTaskRun(ecs, taskArn, (task) => {

                                // TODO: refactor
                                const containerInstancesRes = JSON.parse(exec(
                                  `aws ecs describe-container-instances --cluster ${OWNCLOUD_CLUSTER_NAME} --container-instances ${task.containerInstanceArn}`
                                ));
                                const containerInstance = containerInstancesRes.containerInstances.pop();
                                const ec2InstanceRes = JSON.parse(exec(
                                  `aws ec2 describe-instances --instance-ids ${containerInstance.ec2InstanceId}`
                                ));
                                const reservations = ec2InstanceRes.Reservations.pop();
                                const instance = reservations.Instances.pop();
                                user.owncloudMeta.route = `${instance.PublicIpAddress}:${user.owncloudMeta.port}`;

                                console.log('task successfully started! 🎉'.green);

                                user.markModified('owncloudMeta');
                                user.save((err, user) => {
                                  if (err) { return console.log('Could not save user!', err); }
                                  console.log(`User updated with serviceArn "${user.owncloudMeta.serviceArn}"`.green);
                                  if (isLastUser) callback();
                                });

                              });
                            });
                          });

                        }, 8000);
                      });
                    });
                  });

                });
                // TODO: place a message-queue notification to update all the nginx proxy.conf's on all running nginx containers
              } else {
                console.log('❗️ could not create service in the cluster ❗️'.red);
                if (isLastUser) callback();
              }
            });

          } else {
            if (isLastUser) callback();
          }
        });

      } else {
        user.owncloudMeta.serviceArn = customerService;
        user.save((err, user) => {
          if (err) { return console.log('Could not save user!', err); }
          console.log(`User updated with serviceArn "${customerService}"`.green);
        });
        if (isLastUser) callback();
      }
    });
  });
};

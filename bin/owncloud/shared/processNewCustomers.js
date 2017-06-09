import colors from 'colors';
import User from '../../shared/schema/user';
import {
  exec,
  createTaskDef,
  waitForTaskRun,
  addSlashes,
} from '../../shared/utils';
import {
  CLUSTER_NAME,
  TASK_DEFINITION,
  SECURITY_GROUP_ID,
  LOAD_BALANCER_NAME,
  SSL_CERT_ID,
 } from './constants';

export default (users, callback) => {

  // get a listing of all current clusters
  let clusterArns;
  const listClusterStr = exec('aws ecs list-clusters');
  if (listClusterStr && typeof listClusterStr === 'string') {
    const listClusterJson = JSON.parse(listClusterStr);
    clusterArns = listClusterJson.clusterArns;
  }

  let servicesArns;
  const listServicesStr = exec(`aws ecs list-services --cluster ${CLUSTER_NAME}`);
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

  // iterate over all users
  console.log(`Processing ${users.length} new users..`.blue);
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
          `aws ecs create-service --cluster ${CLUSTER_NAME} --service-name ${customer}-owncloud --task-definition ${customer}-owncloud --desired-count 1`
        ));

        if (serviceRes.service.status === 'ACTIVE') {
          console.log(`service "sb-${customer}-owncloud" successfully created! 🚚`.green);
          user.ecsOwncloudServiceArn = serviceRes.service.serviceArn;

          // run new task in this service
          try {
            exec(`aws ecs run-task --cluster ${CLUSTER_NAME} --task-definition ${customer}-owncloud --group service:${customer}-owncloud`);
          } catch (e) {
            // ignore
          }

          setTimeout(() => {
            const taskListRes = JSON.parse(exec(`aws ecs list-tasks --cluster ${CLUSTER_NAME} --service ${customer}-owncloud`));
            taskListRes.taskArns.forEach((taskArn) => {
              waitForTaskRun(taskArn, (describeTaskRes) => {
                console.log('task successfully started! 🎉'.green);

                // update EC2 security-group and load-balancer to enable access for the new port on "stackbee.cloud"
                exec(`aws ec2 authorize-security-group-ingress --group-id ${SECURITY_GROUP_ID} --protocol tcp --port ${user.owncloudPort} --cidr 0.0.0.0/0`);

                try {
                  const listeners = [
                    {
                      "Protocol": "HTTPS",
                      "LoadBalancerPort": user.owncloudPort,
                      "InstanceProtocol": "HTTP",
                      "InstancePort": user.owncloudPort,
                      "SSLCertificateId": SSL_CERT_ID
                    }
                  ];
                  exec(`aws elb create-load-balancer-listeners --load-balancer-name ${LOAD_BALANCER_NAME} --listeners "${addSlashes(JSON.stringify(listeners))}"`);
                } catch (e) {
                  // ignore
                }

                user.save((err, user) => {
                  if (err) { return console.log('Could not save user!', err); }
                  console.log(`User updated with serviceArn "${customerService}"`.green);
                });

                callback();
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

  // if (clusterArns.length > 0) {
  //   users.forEach((customer) => {
  //     let alreadyCreated = false;
  //     for (let i = 0, len = clusterArns.length; i < len; i += 1) {
  //       if (clusterArns[i].includes(customer, 1)) {
  //         alreadyCreated = true;

  //         console.log(`cluster for customer "${customer}" already created! 🎉`.blue);

  //         break;
  //       }
  //     }

  //     if (!alreadyCreated) {

  //       // create new owncloud cluster for this customer
  //       const clusterRes = JSON.parse(exec(`aws ecs create-cluster --cluster-name sb-${customer}-owncloud`));

  //       if (clusterRes.cluster.status === 'ACTIVE') {
  //         console.log(`cluster "sb-${customer}-owncloud" successfully created! 🚀`.green);

  //         // create new service in this cluster
  //         const serviceRes = JSON.parse(exec(
  //           `aws ecs create-service --cluster sb-${customer}-owncloud --service-name ${customer}-owncloud --task-definition ${TASK_DEFINITION} --desired-count 1`
  //         ));

  //         if (serviceRes.service.status === 'ACTIVE') {
  //           console.log(`service "sb-${customer}-owncloud" successfully created! 🚚`.green);

  //           // register new EC2 container instance
  //           // const instanceRes = JSON.parse(exec(`aws ecs register-container-instance --cluster sb-${customer}-owncloud`));
  //           // console.log(instanceRes);

  //           // run new task in this service
  //           // const taskRes = JSON.parse(exec(`aws ecs run-task --cluster sb-${customer}-owncloud --task-definition ${TASK_DEFINITION}`));
  //           // console.log(taskRes);

  //           // if (taskRes.taskDefinition.status === 'ACTIVE') {
  //           //   console.log(`task-definition successfully created! 📦`.green);
  //           // } else {
  //           //   console.log('❗️ could not create task-definition in the new service ❗️'.red);
  //           // }

  //         } else {
  //           console.log('❗️ could not create the service in the new cluster ❗️'.red);
  //         }
  //       } else {
  //         console.log('❗️ could not create new cluster ❗️'.red);
  //       }
  //     }
  //   });

  // } else {
  //   console.log('❗️ could not get listing of clusters ❗️'.red);
  // }
};

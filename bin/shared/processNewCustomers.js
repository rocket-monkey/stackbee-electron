import colors from 'colors';
import {
  exec,
  addSlashes,
  createTaskDef,
  waitForTaskRun,
} from '../shared/utils';

export default (customers) => {
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
        return true;
      }
    }

    return false;
  }

  customers.forEach((customer) => {
    if (!customerExistsInServices(customer)) {
      const domain = customer; // TODO: make sure a user has usable subdomain!
      createTaskDef(customer, domain);

      // create new database on RDS for this new owncloud installation
      const user = 'sbmaria';
      const password = 'iqk2fJAKY744';
      const host = 'sb-maria.cfwyrgfxdbjd.eu-west-1.rds.amazonaws.com';
      const dbName = domain.replace(/-/i, '_');
      exec(
        `mysql -u ${user} -h ${host} -p${password} -e "CREATE DATABASE IF NOT EXISTS sb_${dbName}_owncloud CHARACTER SET utf8 COLLATE utf8_general_ci;"`
      );
      console.log(`new database name: sb_${dbName}_owncloud 👊🏼`.green);

      // create new service in this cluster
      const serviceRes = JSON.parse(exec(
        `aws ecs create-service --cluster ${CLUSTER_NAME} --service-name ${customer}-owncloud --task-definition sb-owncloud-${customer} --desired-count 1`
      ));

      if (serviceRes.service.status === 'ACTIVE') {
        console.log(`service "sb-${customer}-owncloud" successfully created! 🚚`.green);

        // run new task in this service
        const taskRes = JSON.parse(exec(`aws ecs run-task --cluster ${CLUSTER_NAME} --task-definition sb-owncloud-${customer} --group service:${customer}-owncloud`));
        console.log('taskRes', taskRes);
        taskRes.tasks.forEach((task) => {
          console.log(task);
          console.log(task.containers);
          if (task.lastStatus === 'PENDING') {

            // wait for the task to become ACTIVE
            waitForTaskRun(task, (describeTaskRes) => {
              console.log(describeTaskRes);
              console.log('task successfully started! 🎉'.green);

              // update Route 53 DNS with the new custom port and the subdomain of the customer to point to his new owncloud instance
              // TODO: impelment this shit
            });
          }
        });

        if (taskRes.taskDefinition.status === 'ACTIVE') {
          console.log(`task-definition successfully created! 📦`.green);
        } else {
          console.log('❗️ could not run task in the new service ❗️'.red);
        }

      } else {
        console.log('❗️ could not create service in the cluster ❗️'.red);
      }
    }
  });

  // if (clusterArns.length > 0) {
  //   customers.forEach((customer) => {
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

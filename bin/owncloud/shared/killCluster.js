import {
  exec,
} from '../../shared/utils';

export default (clusterName, stackName) => {

  // stop all running tasks of the cluster
  let killedTasks = 0;
  const listTasksStr = exec(`aws ecs list-tasks --cluster ${clusterName}`);
  if (listTasksStr && typeof listTasksStr === 'string') {
    const listTasksJson = JSON.parse(listTasksStr);
    listTasksJson.taskArns.forEach((taskArn) => {
      exec(`aws ecs stop-task --cluster ${clusterName} --task ${taskArn}`);
      killedTasks++;
    });
  }

  console.log(`killed ${killedTasks} tasks successfully! 💪`.green);

  // delete all services
  let killedServices = 0;
  const listServicesStr = exec(`aws ecs list-services --cluster ${clusterName}`);
  if (listServicesStr && typeof listServicesStr === 'string') {
    const listServicesJson = JSON.parse(listServicesStr);
    listServicesJson.serviceArns.forEach((serviceArn) => {
      exec(`aws ecs update-service --cluster ${clusterName} --service ${serviceArn} --desired-count 0`);
      exec(`aws ecs delete-service --cluster ${clusterName} --service ${serviceArn}`);
      killedServices++;
    });
  }

  console.log(`killed ${killedServices} services successfully! 💪`.green);

  // delete all task definitions
  let killedTaskDefs = 0;
  const listTaskDefsStr = exec(`aws ecs list-task-definitions --no-paginate`);
  if (listTaskDefsStr && typeof listTaskDefsStr === 'string') {
    const listTaskDefsJson = JSON.parse(listTaskDefsStr);
    listTaskDefsJson.taskDefinitionArns.forEach((taskDefArn) => {
      if (taskDefArn.includes('owncloud', 1)) {
        exec(`aws ecs deregister-task-definition --task-definition ${taskDefArn}`);
        killedTaskDefs++;
      }
    });
  }

  console.log(`killed ${killedTaskDefs} task-definitions successfully! 💪`.green);

  // delete the empty cluster now trough cloud-formation!
  exec(`aws cloudformation delete-stack --stack-name ${stackName}`);
};

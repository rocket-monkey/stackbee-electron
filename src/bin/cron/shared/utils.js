import colors from 'colors';
import {
  exec,
  addSlashes,
} from '../../../shared/utils';

const TASK_RUN_WAIT_TIMEOUT = 1000;
const TASK_RUN_MAX_WAIT_INTERVALS = 600; // 10min

export const createTaskDef = (user) => {
  const volumes = [
    {
      'name': 'efs',
      'host': {
        'sourcePath': `/mnt/efs/owncloud/${user.domain}`
      }
    }
  ];

  const definition = [
    {
      'name': `sb-${user.name}-owncloud`,
      'image': 'stackbeeio/nextcloud',
      'cpu': 33,
      'memory': 600,
      'mountPoints': [
        {
          'containerPath': '/efs/data',
          'sourceVolume': 'efs',
          'readOnly': false
        }
      ],
      'logConfiguration': {
        'logDriver': 'awslogs',
        'options': {
          'awslogs-group': 'ECSLogGroup-sb-owncloud-deps',
          'awslogs-region': 'eu-west-1',
          'awslogs-stream-prefix': `sb-${user.name}-owncloud`
        }
      },
      'portMappings': [
        {
          'hostPort': user.owncloudMeta.port,
          'containerPort': 80,
          'protocol': 'tcp'
        }
      ],
      'environment' : [
        { 'name' : 'CUSTOMER_DOMAIN', 'value' : user.domain },
        { 'name' : 'DB_HOST', 'value' : user.owncloudMeta.dbHost },
        { 'name' : 'DB_NAME', 'value' : user.owncloudMeta.dbName },
        { 'name' : 'DB_USER', 'value' : user.owncloudMeta.dbUser },
        { 'name' : 'DB_PASS', 'value' : user.owncloudMeta.dbPassword }
      ],
      'essential': true
    }
  ];

  const taskRes = JSON.parse(exec(
    `aws ecs register-task-definition --family ${user.name}-owncloud --network-mode "bridge" --volumes "${addSlashes(JSON.stringify(volumes))}" --container-definitions "${addSlashes(JSON.stringify(definition))}"`
  ));

  if (taskRes.taskDefinition.status === 'ACTIVE') {
    console.log(`task def successfully updated! 🎉`.blue);
    return true;
  }

  return false;
};

let intervals = 0;
export const waitForTaskRun = (clusterName, taskArn, callback) => {
  setTimeout(() => {
    if (intervals >= TASK_RUN_MAX_WAIT_INTERVALS) {
      console.log(`waiting for task-run exceeded max-wait-intervals of ${TASK_RUN_MAX_WAIT_INTERVALS} 😢`.red);
      intervals = 0;
      callback();
      return;
    }

    const describeTaskRes = JSON.parse(exec(
      `aws ecs describe-tasks --cluster ${clusterName} --tasks ${taskArn}`
    ));

    // console.log('wot', describeTaskRes);

    const task = describeTaskRes.tasks.pop();
    if (task.lastStatus === 'RUNNING') {
      console.log('running callback');
      intervals = 0;
      callback(task);
    } else if (task.lastStatus === 'PENDING') {
      console.log('wait again', );
      intervals++;
      waitForTaskRun(clusterName, taskArn, callback);
    }
  }, TASK_RUN_WAIT_TIMEOUT);
};


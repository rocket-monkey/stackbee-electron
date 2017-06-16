import colors from 'colors';

const TASK_RUN_WAIT_TIMEOUT = 1000;
const TASK_RUN_MAX_WAIT_INTERVALS = 600; // 10min

const execSync = require('child_process').execSync;

export const exec = (cmd) => {
  const options = {
    encoding: 'utf8'
  };

  return execSync(cmd, options);
};

export const addSlashes = (str) => (
  (str + '').replace(/[\\"']/g, '\\$&').replace(/\  u0000/g, '\\0')
);

export const findArg = (argName) => {
  for (let i = 0, len = process.argv.length; i < len; i += 1) {
    if (process.argv[i].indexOf(argName) > -1) {
      return process.argv[i].split('=')[1];
    }
  }

  return null;
}

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
      'image': 'stackbeeio/owncloud',
      'cpu': 10,
      'memory': 500,
      'mountPoints': [
        {
          'containerPath': '/efs/data',
          'sourceVolume': 'efs',
          'readOnly': false
        }
      ],
      'portMappings': [
        {
          'hostPort': user.owncloudMeta.owncloudPort,
          'containerPort': 80,
          'protocol': 'tcp'
        }
      ],
      'environment' : [
        { 'name' : 'CUSTOMER_DOMAIN', 'value' : user.domain }
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
    console.log('wot', describeTaskRes);

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



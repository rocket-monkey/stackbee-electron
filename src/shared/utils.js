import colors from 'colors';

const TASK_RUN_WAIT_TIMEOUT = 1000;
const TASK_RUN_MAX_WAIT_INTERVALS = 20;

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
  const customer = user.name;
  const domain = customer; // TODO: make sure a user has usable subdomain!

  const volumes = [
    {
      'name': 'efs',
      'host': {
        'sourcePath': '/mnt/efs/owncloud/${domain}'
      }
    }
  ];

  const definition = [
    {
      'name': `sb-${customer}-owncloud`,
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
        { 'name' : 'CUSTOMER_DOMAIN', 'value' : domain }
      ],
      'essential': true
    }
  ];

  const taskRes = JSON.parse(exec(
    `aws ecs register-task-definition --family ${customer}-owncloud --network-mode "bridge" --volumes "${addSlashes(JSON.stringify(volumes))}" --container-definitions "${addSlashes(JSON.stringify(definition))}"`
  ));

  if (taskRes.taskDefinition.status === 'ACTIVE') {
    console.log(`task def successfully updated! 🎉`.blue);
    return domain;
  }

  return null;
};

let intervals = 0;
export const waitForTaskRun = (clusterName, taskArn, callback) => {
  setTimeout(() => {
    intervals++;
    if (intervals >= TASK_RUN_MAX_WAIT_INTERVALS) {
      console.log(`waiting for task-run exceeded max-wait-intervals of ${TASK_RUN_MAX_WAIT_INTERVALS} 😢`.red);
      intervals = 0;
      callback();
      return;
    }

    const describeTaskRes = JSON.parse(exec(
      `aws ecs describe-tasks --cluster ${clusterName} --tasks ${taskArn}`
    ));

    const task = describeTaskRes.tasks.pop();
    if (task.lastStatus === 'RUNNING') {
      intervals = 0;
      callback(task);
    } else if (task.lastStatus === 'PENDING') {
      waitForTaskRun(clusterName, taskArn, callback);
    }
  }, TASK_RUN_WAIT_TIMEOUT);
};



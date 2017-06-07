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

export const createTaskDef = (customer, domain) => {
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
      'hostname': `${domain}.stackbee.cloud`,
      'image': 'owncloud',
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
          'hostPort': 1080,
          'containerPort': 80,
          'protocol': 'tcp'
        }
      ],
      'essential': true
    }
  ];

  const taskRes = JSON.parse(exec(
    `aws ecs register-task-definition --family sb-owncloud-${customer} --network-mode "bridge" --volumes "${addSlashes(JSON.stringify(volumes))}" --container-definitions "${addSlashes(JSON.stringify(definition))}"`
  ));

  if (taskRes.taskDefinition.status === 'ACTIVE') {
    console.log(`task def successfully updated! 🎉`.blue);
  }
};

export const waitForTaskRun = (task, callback) => {
  let intervals = 0;
  setTimeout(() => {
    intervals++;
    if (intervals >= TASK_RUN_MAX_WAIT_INTERVALS) {
      console.log(`waiting for task-run exceeded max-wait-intervals of ${TASK_RUN_MAX_WAIT_INTERVALS} 😢`.red);
      return;
    }

    const describeTaskRes = JSON.parse(exec(
      `aws ecs describe-tasks --cluster ${CLUSTER_NAME} --tasks ${task.taskArn}"`
    ));
    console.log(describeTaskRes);
    if (describeTaskRes.lastStatus === 'ACTIVE') {
      callback(describeTaskRes);
    } else if (describeTaskRes.lastStatus === 'PENDING') {
      waitForTaskRun(task);
    }
  }, TASK_RUN_WAIT_TIMEOUT);
};

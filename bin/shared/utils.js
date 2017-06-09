import colors from 'colors';
import mongoose from 'mongoose';

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
          'hostPort': user.owncloudPort,
          'containerPort': 80,
          'protocol': 'tcp'
        }
      ],
      'essential': true
    }
  ];

  const taskRes = JSON.parse(exec(
    `aws ecs register-task-definition --family ${customer}-owncloud --network-mode "bridge" --volumes "${addSlashes(JSON.stringify(volumes))}" --container-definitions "${addSlashes(JSON.stringify(definition))}"`
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

const getDbConnectionUrl = () => {
  const defaultUrl = process.env.DATABASE ? (process.env.DATABASE) : 'mongodb://admin:98eb9Vb6mfvVVoHT@ds163561.mlab.com:63561/sb-mongo-prod';
  return process.env.NODE_ENV === 'test' ? 'mongodb://localhost:27017/sb-owncloud-test' : defaultUrl;
};

export const connectDb = () => {
  // Use promises for mongoose async operations.
  mongoose.Promise = Promise;
  mongoose.connect(getDbConnectionUrl(), {
    server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
    replset: { socketOptions: { keepAlive: 1, connectTimeoutMS : 30000 } },
  });

  mongoose.connection.on('connected', () => {
    console.log(colors.green(`Mongoose default connection open to ${getDbConnectionUrl()}`));
  });

  mongoose.connection.on('error', (err) => {
    console.log(colors.red(`Mongoose default connection error: ${err}`));
  });

  mongoose.connection.on('disconnected', () => {
    console.log(colors.green('Mongoose default connection disconnected'));
  });

  // If the Node process ends, close the Mongoose connection
  process.on('SIGINT', () => {
    mongoose.connection.close(() => {
      console.log(colors.rainbow('Mongoose default connection disconnected through app termination')); // eslint-disable-line max-len
      process.exit(0);
    });
  });
};

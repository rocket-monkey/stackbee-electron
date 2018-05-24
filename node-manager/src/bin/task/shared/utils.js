import colors from 'colors';
import {
  exec,
  addSlashes,
} from '../../../shared/utils';
import {
  RDS_PROD_DATABASE,
  OWNCLOUD_CLUSTER_NAME,
  OWNCLOUD_SECURITY_GROUP_ID,
  OWNCLOUD_LOAD_BALANCER_NAME,
  OWNCLOUD_SSL_CERT_ID,
} from '../../../shared/constants';

const TASK_RUN_WAIT_TIMEOUT = 1000;
const TASK_RUN_MAX_WAIT_INTERVALS = 600; // 10min

export const createTaskDef = (user, ecs, callback) => {

  // const volumes = [
  //   {
  //     'name': 'efs',
  //     'host': {
  //       'sourcePath': `/mnt/efs/owncloud/${user.domain}`
  //     }
  //   }
  // ];

  // const definition = [
  //   {
  //     'name': `sb-${user.name}-owncloud`,
  //     'image': 'stackbeeio/nextcloud',
  //     'cpu': 33,
  //     'memory': 600,
  //     'mountPoints': [
  //       {
  //         'containerPath': '/efs/data',
  //         'sourceVolume': 'efs',
  //         'readOnly': false
  //       }
  //     ],
  //     'logConfiguration': {
  //       'logDriver': 'awslogs',
  //       'options': {
  //         'awslogs-group': 'ECSLogGroup-sb-owncloud-deps',
  //         'awslogs-region': 'eu-west-1',
  //         'awslogs-stream-prefix': `sb-${user.name}-owncloud`
  //       }
  //     },
  //     'portMappings': [
  //       {
  //         'hostPort': user.owncloudMeta.port,
  //         'containerPort': 80,
  //         'protocol': 'tcp'
  //       }
  //     ],
  //     'environment' : [
  //       { 'name' : 'CUSTOMER_DOMAIN', 'value' : user.domain },
  //       { 'name' : 'DB_HOST', 'value' : user.owncloudMeta.dbHost },
  //       { 'name' : 'DB_NAME', 'value' : user.owncloudMeta.dbName },
  //       { 'name' : 'DB_USER', 'value' : user.owncloudMeta.dbUser },
  //       { 'name' : 'DB_PASS', 'value' : user.owncloudMeta.dbPassword }
  //     ],
  //     'essential': true
  //   }
  // ];

  // const taskRes = JSON.parse(exec(
  //   `aws ecs register-task-definition --family ${user.name}-owncloud --network-mode "bridge" --volumes "${addSlashes(JSON.stringify(volumes))}" --container-definitions "${addSlashes(JSON.stringify(definition))}"`
  // ));

  const params = {
    family: `${user.name}-owncloud`,
    volumes: [
      {
        'name': 'efs',
        'host': {
          'sourcePath': `/mnt/efs/owncloud/${user.domain}`
        }
      },
      {
        'name': 'efs-apps',
        'host': {
          'sourcePath': `/mnt/efs/nextcloud/${user.domain}/custom_apps`
        }
      },
      {
        'name': 'efs-theming',
        'host': {
          'sourcePath': `/mnt/efs/nextcloud/${user.domain}/theming`
        }
      }
    ],
    containerDefinitions: [
      {
        name: `sb-${user.name}-owncloud`,
        image: 'stackbeeio/nextcloud',
        cpu: 33,
        memory: 600,
        mountPoints: [
          {
            containerPath: '/efs/data',
            sourceVolume: 'efs',
            readOnly: false
          },
          {
            containerPath: '/efs/custom_apps',
            sourceVolume: 'efs-apps',
            readOnly: false
          },
          {
            containerPath: '/efs/theming',
            sourceVolume: 'efs-theming',
            readOnly: false
          }
        ],
        logConfiguration: {
          logDriver: 'awslogs',
          options: {
            'awslogs-group': 'ECSLogGroup-sb-owncloud-deps',
            'awslogs-region': 'eu-west-1',
            'awslogs-stream-prefix': `sb-${user.name}-owncloud`
          }
        },
        portMappings: [
          {
            hostPort: user.owncloudMeta.port,
            containerPort: 80,
            protocol: 'tcp'
          }
        ],
        environment : [
          { name : 'CUSTOMER_DOMAIN', value : user.domain },
          { name : 'DB_HOST', value : user.owncloudMeta.dbHost },
          { name : 'DB_NAME', value : user.owncloudMeta.dbName },
          { name : 'DB_USER', value : user.owncloudMeta.dbUser },
          { name : 'DB_PASS', value : user.owncloudMeta.dbPassword }
        ],
        essential: true
      }
    ]
  };

  ecs.registerTaskDefinition(params, (err, data) => {
    if (err) {
      console.log(err, err.stack); // an error occurred
      return callback(false);
    }

    if (data.taskDefinition.status === 'ACTIVE') {
      console.log(`task def successfully updated! 🎉`.blue);
      return callback(true);
    }

    callback(false);
  });
};

let intervals = 0;
export const waitForTaskRun = (ecs, taskArn, callback) => {
  setTimeout(() => {
    if (intervals >= TASK_RUN_MAX_WAIT_INTERVALS) {
      console.log(`waiting for task-run exceeded max-wait-intervals of ${TASK_RUN_MAX_WAIT_INTERVALS} 😢`.red);
      intervals = 0;
      callback();
      return;
    }

    ecs.describeTasks({ cluster: OWNCLOUD_CLUSTER_NAME, tasks: [taskArn] }, (err, data) => {
      if (err) return console.log(err, err.stack); // an error occurred

      const task = data.tasks.pop();
      if (task.lastStatus === 'RUNNING') {
        console.log('running callback');
        intervals = 0;
        callback(task);
      } else if (task.lastStatus === 'PENDING') {
        console.log('wait again', );
        intervals++;
        waitForTaskRun(ecs, taskArn, callback);
      }
    });
  }, TASK_RUN_WAIT_TIMEOUT);
};


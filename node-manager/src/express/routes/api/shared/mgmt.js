import User from '../../../../shared/db/schema/user';

import {
  exec,
  addSlashes,
} from '../../../../shared/utils';

import {
  OWNCLOUD_CLUSTER_NAME,
} from '../../../../shared/constants';

export const updateOcRoute = (req, res, next) => {
  if (req.decoded.email !== 'admin@stackbee.io') {
    return res.status(403).send({
        success: false,
        message: 'Only stackbee.io admin can access this route!'
    });
  }

  const domain = req.params.domain;
  User.findOne({ domain }, (err, user) => {
    if (err) { return console.log('Could not load user!', err); }

    const taskListRes = JSON.parse(exec(`aws ecs list-tasks --cluster ${OWNCLOUD_CLUSTER_NAME} --service ${domain}-owncloud`));
    const taskArn = taskListRes.taskArns.pop();

    const describeTaskRes = JSON.parse(exec(
      `aws ecs describe-tasks --cluster ${OWNCLOUD_CLUSTER_NAME} --tasks ${taskArn}`
    ));

    const task = describeTaskRes.tasks.pop();

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

    user.markModified('owncloudMeta');
    user.save((err, user) => {
      if (err) { return console.log('Could not save user!', err); }
      console.log(`User updated with serviceArn "${user.owncloudMeta.serviceArn}"`.green);

      res.send('updated');
    });
  });
};

export const loggo = (req, res, next) => {
  const message = req.params.message;
  console.log(`🤘🤘🤘🤘🤘🤘🤘🤘🤘🤘🤘🤘🤘🤘🤘🤘🤘🤘🤘🤘🤘🤘🤘🤘🤘🤘🤘🤘🤘🤘🤘🤘`);
  console.log(`❗️ LOGGO MESSAGO ❗️ ${message}`);
  console.log(`🤘🤘🤘🤘🤘🤘🤘🤘🤘🤘🤘🤘🤘🤘🤘🤘🤘🤘🤘🤘🤘🤘🤘🤘🤘🤘🤘🤘🤘🤘🤘🤘`);
  res.send('logged!');
};

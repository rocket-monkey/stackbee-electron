import colors from 'colors';
import {
  exec,
  addSlashes,
} from '../../../shared/utils';
import {
  NGINX_STACK_NAME,
  NODEJS_STACK_NAME,
  OWNCLOUD_STACK_NAME,
} from '../../../shared/constants';

export const startEcsOwncloudDeps = () => {

  // first create "owncloud-deps" -> all the dependencies needed for the cluster
  const templateUrl = 'https://s3-eu-west-1.amazonaws.com/stackbee-cloudformation/owncloud-deps.json';
  const params = [
    {
      "ParameterKey": "CIDRVPC",
      "ParameterValue": "10.10.0.0/16",
      "UsePreviousValue": false
    },
    {
      "ParameterKey": "CIDRSubnet1",
      "ParameterValue": "10.10.1.0/24",
      "UsePreviousValue": false
    },
    {
      "ParameterKey": "CIDRSubnet2",
      "ParameterValue": "10.10.2.0/24",
      "UsePreviousValue": false
    }
  ];
  exec(`aws cloudformation create-stack --stack-name ${OWNCLOUD_STACK_NAME}-deps --template-url ${templateUrl} --parameters "${addSlashes(JSON.stringify(params))}"`);
};

export const startEcsOwncloud = () => {

  // after we run "createClusterDependencies", we can go and manually create the desired EFS volume in the available VPC from deps now
  // --> manually because we won't to auto-delete the EFS when we kill the stack with cloudformation!

  const deps = getDeps();
  const fileSystemID = "fs-900ec659";

  // finally, create the ecs cluster with a given EFS FileSystemID (the one we created manually, this way we can still kill the cluster with cloudformation but the EFS data will be kept!)
  const templateUrl = 'https://s3-eu-west-1.amazonaws.com/stackbee-cloudformation/owncloud-ecs.json';
  const params = [
    {
      "ParameterKey": "KeyName",
      "ParameterValue": "stackbee-owncloud",
      "UsePreviousValue": false
    },
    {
      "ParameterKey": "DesiredCapacity",
      "ParameterValue": "1",
      "UsePreviousValue": false
    },
    {
      "ParameterKey": "AsgMaxSize",
      "ParameterValue": "1000",
      "UsePreviousValue": false
    },
    {
      "ParameterKey": "InstanceType",
      "ParameterValue": "t2.small",
      "UsePreviousValue": false
    },
    {
      "ParameterKey": "SSHLocation",
      "ParameterValue": "0.0.0.0/0",
      "UsePreviousValue": false
    },
    {
      "ParameterKey": "VPC",
      "ParameterValue": deps.VPCID,
      "UsePreviousValue": false
    },
    {
      "ParameterKey": "Subnet1ID",
      "ParameterValue": deps.Subnet1ID,
      "UsePreviousValue": false
    },
    {
      "ParameterKey": "Subnet2ID",
      "ParameterValue": deps.Subnet2ID,
      "UsePreviousValue": false
    },
    {
      "ParameterKey": "MountTargetSecurityGroupID",
      "ParameterValue": deps.MountTargetSecurityGroupID,
      "UsePreviousValue": false
    },
    {
      "ParameterKey": "FileSystemID",
      "ParameterValue": fileSystemID,
      "UsePreviousValue": false
    }
  ];
  exec(`aws cloudformation create-stack --stack-name ${OWNCLOUD_STACK_NAME} --capabilities CAPABILITY_IAM --template-url ${templateUrl} --parameters "${addSlashes(JSON.stringify(params))}"`);
};

export const startEcsNodejs = () => {

  const deps = getDeps();

  const templateUrl = 'https://s3-eu-west-1.amazonaws.com/stackbee-cloudformation/nodejs-ecs.json';
  const params = [
    {
      "ParameterKey": "KeyName",
      "ParameterValue": "stackbee-nodejs",
      "UsePreviousValue": false
    },
    {
      "ParameterKey": "DesiredCapacity",
      "ParameterValue": "1",
      "UsePreviousValue": false
    },
    {
      "ParameterKey": "MaxSize",
      "ParameterValue": "1000",
      "UsePreviousValue": false
    },
    {
      "ParameterKey": "InstanceType",
      "ParameterValue": "t2.micro",
      "UsePreviousValue": false
    },
    {
      "ParameterKey": "VPC",
      "ParameterValue": deps.VPCID,
      "UsePreviousValue": false
    },
    {
      "ParameterKey": "Subnet1ID",
      "ParameterValue": deps.Subnet1ID,
      "UsePreviousValue": false
    },
    {
      "ParameterKey": "Subnet2ID",
      "ParameterValue": deps.Subnet2ID,
      "UsePreviousValue": false
    },
  ];
  exec(`aws cloudformation create-stack --stack-name ${NODEJS_STACK_NAME} --capabilities CAPABILITY_IAM --template-url ${templateUrl} --parameters "${addSlashes(JSON.stringify(params))}"`);
};

export const startEcsNginx = () => {

  const deps = getDeps();

  const templateUrl = 'https://s3-eu-west-1.amazonaws.com/stackbee-cloudformation/nginx-ecs.json';
  const params = [
    {
      "ParameterKey": "KeyName",
      "ParameterValue": "stackbee-nginx",
      "UsePreviousValue": false
    },
    {
      "ParameterKey": "DesiredCapacity",
      "ParameterValue": "1",
      "UsePreviousValue": false
    },
    {
      "ParameterKey": "MaxSize",
      "ParameterValue": "1000",
      "UsePreviousValue": false
    },
    {
      "ParameterKey": "InstanceType",
      "ParameterValue": "t2.micro",
      "UsePreviousValue": false
    },
    {
      "ParameterKey": "VPC",
      "ParameterValue": deps.VPCID,
      "UsePreviousValue": false
    },
    {
      "ParameterKey": "Subnet1ID",
      "ParameterValue": deps.Subnet1ID,
      "UsePreviousValue": false
    },
    {
      "ParameterKey": "Subnet2ID",
      "ParameterValue": deps.Subnet2ID,
      "UsePreviousValue": false
    },
  ];
  exec(`aws cloudformation create-stack --stack-name ${NGINX_STACK_NAME} --capabilities CAPABILITY_IAM --template-url ${templateUrl} --parameters "${addSlashes(JSON.stringify(params))}"`);
};

const getDeps = () => {
  const depsStackRes = JSON.parse(exec(
    `aws cloudformation describe-stacks --stack-name ${OWNCLOUD_STACK_NAME}-deps`
  ));
  const depsStack = depsStackRes.Stacks.pop();
  let VPCID;
  let Subnet1ID;
  let Subnet2ID;
  let MountTargetSecurityGroupID;
  depsStack.Outputs.forEach((entry) => {
    if (entry.OutputKey === 'VPCID') {
      VPCID = entry.OutputValue;
    }
    if (entry.OutputKey === 'Subnet1ID') {
      Subnet1ID = entry.OutputValue;
    }
    if (entry.OutputKey === 'Subnet2ID') {
      Subnet2ID = entry.OutputValue;
    }
    if (entry.OutputKey === 'MountTargetSecurityGroupID') {
      MountTargetSecurityGroupID = entry.OutputValue;
    }
  });

  return {
    VPCID,
    Subnet1ID,
    Subnet2ID,
    MountTargetSecurityGroupID,
  };
}
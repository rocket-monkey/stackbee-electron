import colors from 'colors';
import {
  exec,
  addSlashes,
} from '../../shared/utils';

export const createClusterDependencies = (stackName) => {
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
  exec(`aws cloudformation create-stack --stack-name ${stackName}-deps --template-url ${templateUrl} --parameters "${addSlashes(JSON.stringify(params))}"`);
};

export default (stackName) => {

  // after we run "createClusterDependencies", we can go and manually create the desired EFS volume in the available VPC from deps now
  // --> manually because we won't to auto-delete the EFS when we kill the stack with cloudformation!

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
      "ParameterValue": "vpc-54e13133",
      "UsePreviousValue": false
    },
    {
      "ParameterKey": "Subnet1ID",
      "ParameterValue": "subnet-3166bb78",
      "UsePreviousValue": false
    },
    {
      "ParameterKey": "Subnet2ID",
      "ParameterValue": "subnet-b2c9dbea",
      "UsePreviousValue": false
    },
    {
      "ParameterKey": "MountTargetSecurityGroupID",
      "ParameterValue": "sg-7fd4c006",
      "UsePreviousValue": false
    },
    {
      "ParameterKey": "FileSystemID",
      "ParameterValue": "fs-900ec659",
      "UsePreviousValue": false
    }
  ];
  exec(`aws cloudformation create-stack --stack-name ${stackName} --capabilities CAPABILITY_IAM --template-url ${templateUrl} --parameters "${addSlashes(JSON.stringify(params))}"`);
};
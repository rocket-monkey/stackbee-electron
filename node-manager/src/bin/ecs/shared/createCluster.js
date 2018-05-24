import fs from 'fs';
import path from 'path';
import aws from 'aws-sdk';
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

import awsConfig from '../../../shared/awsCredentials';

const FILE_SYSTEM_ID = 'fs-900ec659';

aws.config.update(awsConfig);

const s3 = new aws.S3();
const cloudFormation = new aws.CloudFormation();

export const updateEcsOwncloudDeps = () => {
  const templatePath = path.join(process.cwd(), 'cloud_formation', 'owncloud-deps.json')
  const data = fs.readFileSync(templatePath)
  const params = {
    Bucket: 'stackbee-cloudformation',
    Key: 'owncloud-deps.json',
    Body: data
  }
  s3.upload(params, (err, data) => {
    if (err) {
     console.log('error in callback')
     console.log(err)
    }

    cloudFormation.updateStack({
      StackName: `${OWNCLOUD_STACK_NAME}-deps`,
      TemplateURL: 'https://s3-eu-west-1.amazonaws.com/stackbee-cloudformation/owncloud-deps.json',
      Capabilities: ['CAPABILITY_IAM'],
      Parameters: JSON.stringify(getOwncloudDepsStackParams())
    }, (err, data) => {
      if (err) {
        console.log('error in cloudFormation updateStack!')
        console.log(err)
        return
       }

       console.log('success! 🦄', data)
    })
   })
}

export const startEcsOwncloudDeps = () => {

  // first create "owncloud-deps" -> all the dependencies needed for the cluster
  const templateUrl = 'https://s3-eu-west-1.amazonaws.com/stackbee-cloudformation/owncloud-deps.json';
  exec(`aws cloudformation create-stack --stack-name ${OWNCLOUD_STACK_NAME}-deps --template-url ${templateUrl} --parameters "${addSlashes(JSON.stringify(getOwncloudDepsStackParams()))}"`);
};

export const updateEcsOwncloud = () => {
  const templatePath = path.join(process.cwd(), 'cloud_formation', 'owncloud-ecs.json')
  const data = fs.readFileSync(templatePath)
  s3.upload({
    Bucket: 'stackbee-cloudformation',
    Key: 'owncloud-ecs.json',
    Body: data
  }, (err, data) => {
    if (err) {
     console.log('error in s3 upload!')
     console.log(err)
     return
    }

    const params = {
      StackName: OWNCLOUD_STACK_NAME,
      TemplateURL: 'https://s3-eu-west-1.amazonaws.com/stackbee-cloudformation/owncloud-deps.json',
      Capabilities: ['CAPABILITY_IAM'],
      Parameters: JSON.stringify(getOwncloudStackParams())
    }
    cloudFormation.updateStack(params, (err, data) => {
      if (err) {
        console.log('error in cloudFormation updateStack!')
        console.log(err)
        return
       }

       console.log('success! 🦄', data)
    })
   })

  const templateUrl = 'https://s3-eu-west-1.amazonaws.com/stackbee-cloudformation/owncloud-ecs.json';
  exec(`aws cloudformation update-stack --stack-name ${OWNCLOUD_STACK_NAME} --capabilities CAPABILITY_IAM --template-url ${templateUrl} --parameters "${addSlashes(JSON.stringify(getOwncloudStackParams()))}"`);
}

export const startEcsOwncloud = () => {

  // after we run "createClusterDependencies", we can go and manually create the desired EFS volume in the available VPC from deps now
  // --> manually because we won't to auto-delete the EFS when we kill the stack with cloudformation!

  // @see FILE_SYSTEM_ID on top of file

  // finally, create the ecs cluster with a given EFS FileSystemID (the one we created manually, this way we can still kill the cluster with cloudformation but the EFS data will be kept!)
  const templateUrl = 'https://s3-eu-west-1.amazonaws.com/stackbee-cloudformation/owncloud-ecs.json';
  exec(`aws cloudformation create-stack --stack-name ${OWNCLOUD_STACK_NAME} --capabilities CAPABILITY_IAM --template-url ${templateUrl} --parameters "${addSlashes(JSON.stringify(getOwncloudStackParams()))}"`);
};

export const startEcsNodejs = () => {

  const templateUrl = 'https://s3-eu-west-1.amazonaws.com/stackbee-cloudformation/nodejs-ecs.json';
  exec(`aws cloudformation create-stack --stack-name ${NODEJS_STACK_NAME} --capabilities CAPABILITY_IAM --template-url ${templateUrl} --parameters "${addSlashes(JSON.stringify(getNodejsStackParams()))}"`);
};

export const startEcsNginx = () => {

  const templateUrl = 'https://s3-eu-west-1.amazonaws.com/stackbee-cloudformation/nginx-ecs.json';
  exec(`aws cloudformation create-stack --stack-name ${NGINX_STACK_NAME} --capabilities CAPABILITY_IAM --template-url ${templateUrl} --parameters "${addSlashes(JSON.stringify(getNginxStackParams()))}"`);
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

  const deps = {
    VPCID,
    Subnet1ID,
    Subnet2ID,
    MountTargetSecurityGroupID,
  }
  console.log('deps:', deps)
  return deps;
}

const getParam = (key, value, usePrevious = false) => ({
  "ParameterKey": key,
  "ParameterValue": value,
  "UsePreviousValue": usePrevious
})

const getOwncloudStackParams = () => {
  const deps = getDeps()
  const result = [
    getParam('KeyName', 'stackbee-owncloud'),
    getParam('DesiredCapacity', '4'),
    getParam('AsgMaxSize', '1000'),
    getParam('InstanceType', 't2.small'),
    getParam('SSHLocation', '0.0.0.0/0'),
    getParam('VPC', deps.VPCID),
    getParam('Subnet1ID', deps.Subnet1ID),
    getParam('Subnet2ID', deps.Subnet2ID),
    getParam('MountTargetSecurityGroupID', deps.MountTargetSecurityGroupID),
    getParam('FileSystemID', FILE_SYSTEM_ID)
  ]
  console.log('owncloud stack params:', result)
  return result
}

const getOwncloudDepsStackParams = () => {
  const deps = getDeps()
  return [
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
  ]
}

const getNodejsStackParams = () => {
  const deps = getDeps()
  return [
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
  ]
}

const getNginxStackParams = () => {
  const deps = getDeps()
  return [
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
  ]
}
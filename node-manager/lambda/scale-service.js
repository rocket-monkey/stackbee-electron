'use strict';
const aws = require('aws-sdk');

console.log('Loading oc-task-not-starting function');

exports.handler = (event, context, callback) => {
  const ecsService = event.Detail.serviceName;
  const ecsCluster = event.Detail.clusterName;
  const comparisonOperator = event.Detail.comparisonOperator;

  console.log('Comparison Operator= ', comparisonOperator);

  const ecsRegion = 'eu-west-1';

  console.log('ECSService=', ecsService);
  console.log('ECSCluster=', ecsCluster);


  const maxCount = 1000;
  const minCount = 2;
  let desiredCount = null;

  const ecs = new aws.ECS({ region: ecsRegion });

  ecs.describeServices({ services: [ecsService], cluster: ecsCluster }, (err, data) => {
    if (err) {
      console.log(err, err.stack);
      return context.fail();
    }

    desiredCount = data.services[0].desiredCount;
    console.log('desiredCount=', desiredCount);

    if (comparisonOperator == '++') {
      if (desiredCount < maxCount) {
        desiredCount++;
      } else {
        console.log('Service count is already max.');
        context.succeed();
      }
    } else if (comparisonOperator == '--') {
      if (desiredCount > minCount) {
        desiredCount--;
      } else {
        console.log('Service count is already min.');
        context.succeed();
      }
    } else {
      console.log('Unknown comparison operator');
      context.fail();
    }

    const params = {
      service: ecsService,
      desiredCount: desiredCount,
      cluster: ecsCluster,
    };

    ecs.updateService(params, (err, data) => {
      if (err) {
        console.log(err, err.stack);
      } else {
        console.log(data);
        context.succeed();
      }
    });
  });
};

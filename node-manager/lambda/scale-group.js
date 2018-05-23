'use strict';
const aws = require('aws-sdk');

const AUTOSCALING_GROUP = 'sb-owncloud-ECSAutoScalingGroup-12YLDU9U404Q1';

console.log('Loading oc-task-not-starting function');

exports.handler = (event, context, callback) => {
  const comparisonOperator = event.Detail.comparisonOperator;

  console.log('Comparison Operator= ', comparisonOperator);

  const ecsRegion = 'eu-west-1';

  const maxCount = 1000;
  const minCount = 2;
  let desiredCount = null;

  const autoscaling = new aws.AutoScaling();

  var params = {
    AutoScalingGroupNames: [AUTOSCALING_GROUP]
  };

  autoscaling.describeAutoScalingGroups(params, (err, data) => {
    if (err) console.log(err, err.stack); // an error occurred
    else     console.log(data);           // successful response

    desiredCount = data.AutoScalingGroups[0].DesiredCapacity;
    console.log('desiredCount=', desiredCount);

    if (comparisonOperator == '++') {
      if (desiredCount < maxCount) {
        desiredCount++;
      } else {
        console.log('Group count is already max.');
        context.succeed();
      }
    } else if (comparisonOperator == '--') {
      if (desiredCount > minCount) {
        desiredCount--;
      } else {
        console.log('Group count is already min.');
        context.succeed();
      }
    } else {
      console.log('Unknown comparison operator');
      context.fail();
    }

    const params = {
      AutoScalingGroupName: AUTOSCALING_GROUP,
      DesiredCapacity: desiredCount,
      HonorCooldown: true
    };

    autoscaling.setDesiredCapacity(params, (err, data) => {
      if (err) console.log(err, err.stack); // an error occurred
      else     console.log(data);           // successful response
    });
  });
};

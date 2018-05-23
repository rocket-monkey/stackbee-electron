// import aws from 'aws-sdk';
// import csv from 'csv';
// import {
//   getConfigByType,
//   getProcessByType
// } from './utils';
// import awsConfig from '../../../../../shared/awsCredentials';

// aws.config.update(awsConfig);

// const s3 = new aws.S3();

export default (req, res, next) => {
  if (req.decoded.email !== 'admin@stackbee.io') {
    return res.status(403).send({
      success: false,
      message: 'Only stackbee.io admin can access this route!'
    });
  }

  // const csvType = req.query.csvType;

  // const params = {
  //   Bucket: 'stackbee-csv',
  //   Key: req.params.name
  // };

  // s3.getObject(params, (err, data) => {
  //   if (err) throw err;

  //   csv.parse(data.Body.toString(), getConfigByType(csvType), (err, parsed) => {
  //     const processFunction = getProcessByType(csvType);
  //     const entries = processFunction.apply(undefined, [parsed]);
  //     res.send(entries);
  //   });

  // });
};

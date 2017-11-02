import fs from 'fs';
import aws from 'aws-sdk';
import multer from 'multer';
import multerS3 from 'multer-s3';
import tableToCsv from 'node-table-to-csv';
import {
  getProcessByType
} from '../csv/utils';
import awsConfig from '../../../../../shared/awsCredentials';

aws.config.update(awsConfig);

const s3 = new aws.S3();

export const printerUploadMiddleware = multer({ dest: 'uploads/' });

export const printerUploadMiddlewareS3 = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'stackbee-electron',
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      cb(null, Date.now().toString());
    },
  })
});

export const printerUploadS3 = (req, res, next) => {
  if (req.decoded.email !== 'admin@stackbee.io') {
    return res.status(403).send({
      success: false,
      message: 'Only stackbee.io admin can access this route!'
    });
  }

  req.files.forEach((file) => {
    s3.getObject({
      Bucket: 'stackbee-electron',
      Key: file.key,
    }, (err, data) => {
      if (err) throw err;

      console.log('data', data);
    });
  });
  res.send(`Successfully uploaded ${req.files.length} files!`);
};

export default (req, res, next) => {
  if (req.decoded.email !== 'admin@stackbee.io') {
    return res.status(403).send({
      success: false,
      message: 'Only stackbee.io admin can access this route!'
    });
  }

  req.files.forEach((file) => {
    console.log('file', file);
    fs.readFile(file.path, 'utf8', (err, data) => {
      if (err) {
        console.log('err', err);
        return;
      }

      if (data.indexOf('<html>') > -1) {
        // html file content detected!
        const csvData = tableToCsv(data);
        console.log('csv?', csvData.length);

        const csvType = 'default';
        const processFunction = getProcessByType(csvType);
        const entries = processFunction.apply(undefined, [csvData]);
        res.send(entries);
      }

    });
    // xlsjs({
    //   input: file.path,
    // }, (err, results) => {
    //   console.log('err', err);
    //   console.log('results', results);
    // });
  });
  // res.send(`Successfully uploaded ${req.files.length} files!`);
};

import express from 'express';

import {
  nginxProxyConf,
  owncloudAutoconfig,
} from './shared/files';

import {
  authenticate,
} from './shared/auth';

import {
  updateOcRoute,
  loggo,
} from './shared/mgmt';

import processCsv from './shared/csv';

import jwtMiddleware from '../../middlewares/jwt';

const router = express.Router(); // eslint-disable-line new-cap

router.get('/', (req, res, next) => {
  res.send('Hello API!');
});

router.post('/authenticate', authenticate);

// auth middleware to protect everything beyound this point with jwt tokens
router.use(jwtMiddleware);

router.get('/nginx/proxy.conf', nginxProxyConf);
router.get('/owncloud/autoconfig.php/:domain', owncloudAutoconfig);
router.get('/owncloud/update-route/:domain', updateOcRoute);
router.get('/csv/:name', processCsv);
router.get('/loggo/:message', loggo);

export default router;
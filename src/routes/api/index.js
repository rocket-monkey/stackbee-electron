import express from 'express';
import {
  nginxProxyConf,
  owncloudAutoconfig,
} from './shared/files';
const router = express.Router(); // eslint-disable-line new-cap

router.get('/', (req, res, next) => {
  res.send('Hello API!');
});

router.get('/nginx/proxy.conf', nginxProxyConf);
router.get('/owncloud/autoconfig.php/:domain', owncloudAutoconfig);

export default router;
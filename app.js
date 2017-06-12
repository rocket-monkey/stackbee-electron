import express from 'express';
import { connectDb } from './src/bin/shared/utils';
import User from './src/bin/shared/schema/user';

const app = express();

app.get('/', (req, res) => {
  const requestUrl = req.header('host');
  if (requestUrl.indexOf('stackbee.cloud') > -1) {

    // stackbee owncloud route handling

    const subDomain = requestUrl.split('.').shift();
    User.find({ name: subDomain }, (error, users) => {
      if (users.length === 0) {
        console.log('no user found for subDomain', subDomain);
        return res.send('500: Internal Server Error', 500);
      }

      const user = users.pop();
      if (!user.owncloudRoute) {
        console.log('no user found for subDomain', subDomain);
        return res.send('500: Internal Server Error', 500);
      }

      const url = 'https://' + user.owncloudRoute;
      console.log(`redirecting to "${subDomain}" owncloud: ${url}`);
      return res.redirect(url);
    });

  } else {
    res.send('Hello World!');
  }
});

app.listen(3000, () => {
  connectDb();
  console.log('hgo-manager app listening on port 3000!');
});

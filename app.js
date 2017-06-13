import express from 'express';
import { connectDb } from './src/shared/db';
import api from './src/routes/api';

const app = express();

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/api', api);

app.listen(3000, () => {
  connectDb();
  console.log('hgo-manager app listening on port 3000!');
});

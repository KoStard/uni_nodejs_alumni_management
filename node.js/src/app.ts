import express from 'express';
import { createServer } from 'http';
import { networkInterfaces, hostname } from 'os';
import cors from 'cors';
import { AlumniRouter } from './alumniRouter';

import REDIS from 'ioredis';
import { AlumniAccessor } from './accessors/alumniAccessor';
const app = express();
const client = new REDIS({
  host: 'redis',
  port: 6379
});

app.use(cors());
app.use(express.json());
app.use("/alumni", new AlumniRouter(new AlumniAccessor(client)).router);

createServer(app).listen(8080, function () {
  let ips = networkInterfaces();
  console.log('Listening on port ' + (8080) + " on host " + hostname() + " with IP " + ips["eth0"]![0]["address"]);
});

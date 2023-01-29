import express from 'express';
import { createServer } from 'http';
import { networkInterfaces, hostname } from 'os';

import REDIS from 'ioredis';
const app = express();
const client = new REDIS({
  host: 'redis',
  port: 6379
});

app.get('/', (req, res, next) => {
  client.incr('counter', (error, counter) => {
    if (error) throw error;
    console.log("Counter = " + counter);
    let ips = networkInterfaces();
    res.send('<h1>Node.js - Redis Example </h1><div>This page has been viewed <span style="color:red">' +
      counter + '</span> times (data from shared Redis instance)!</div>' +
      '<div style="padding-top:5mm">Current request served by backend node with ID <span style="color:red">'
      + ips["eth0"]![0]["address"] + "</span></div>");
  });
});

app.get('/second', (req, res, next) => {
  res.send("<p>This is a dummy output for the alternative URL /second</p>");
});

createServer(app).listen(80, function () {
  let ips = networkInterfaces();
  console.log('Listening on port ' + (80) + " on host " + hostname() + " with IP " + ips["eth0"]![0]["address"]);
});

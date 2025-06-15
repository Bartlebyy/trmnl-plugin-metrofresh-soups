// functions/api.js
const express    = require('express');
const serverless = require('serverless-http');
const mainApp    = require('../app');      // your bare app

const wrapper = express();
wrapper.use('/api', mainApp);              // add prefix here

exports.handler = serverless(wrapper);

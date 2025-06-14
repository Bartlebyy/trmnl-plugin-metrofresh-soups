const express = require('express');
const serverless = require('serverless-http');
const app = express();

// Import your main application logic
const index = require('../index');

// Use the same routes and middleware as your main app
app.use('/', index);

// Export the serverless handler
module.exports.handler = serverless(app); 
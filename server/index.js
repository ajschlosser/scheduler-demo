const bodyParser = require('body-parser');
const compression = require('compression');
const cors = require('cors');
const express = require('express');
const OpenApiValidator = require('express-openapi-validator');
const path = require('path');

// Helpers
const { errorHandler, getEnvVarsFromFile } = require('./util.js');
getEnvVarsFromFile('../.env');
const init = require('./init');
let port = process.env.SCHEDULER_DEMO_EXPRESS_SERVER_PORT;

// Routes
const scheduleRoutes = require('./api/routes/schedule.routes');
const userRoutes = require('./api/routes/user.routes');
const eventRoutes = require('./api/routes/event.routes');

// Express app
const app = express();
app.use(express.static('../web/build'));  // Static Web server
app.use(/\/((?!api).)*/, function (req, res) {
  res.sendFile('index.html', { root: path.join(__dirname, '../web/build/') });
});
app.use(
  OpenApiValidator.middleware({
    apiSpec: './api.spec.yml',
    validateRequests: true,
    validateResponses: false,
  })
);
app.use(compression());
app.use(cors());
app.use(bodyParser.json());
app.use('/api/schedule', scheduleRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use(errorHandler);

// Init and run
const run = async () => {
  try
  {
    await init();
    await app.listen(port);
    console.log('express server listening on port', port);
  }
  catch (err)
  {
    console.log(err);
  }
};
run();

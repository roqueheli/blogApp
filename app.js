const express = require('express');
const cors = require('cors');
require('express-async-errors');

const app = express();
const mongoose = require('mongoose');
const { errorHandler, unknownEndpoint, requestLogger } = require('./utils/middleware');
const config = require('./utils/config');
const logger = require('./utils/logger');
const blogRouter = require('./controllers/blogApp');
const usersRouter = require('./controllers/users');
const loginRouter = require('./controllers/login');
const { userExtractor } = require('./middlewares/userExtractor');
const { tokenExtractor } = require('./middlewares/tokenExtractor');

mongoose.set('strictQuery', false);

logger.info('connecting to', config.MONGODB_URI);

mongoose.connect(config.MONGODB_URI)
  .then(() => logger.info('connected to MongoDB'))
  .catch((error) => logger.error('error connecting to MongoDB:', error.message));

app.use(cors());
// app.use(express.static('dist'));
app.use(express.json());
app.use(requestLogger);

app.use('/api/login', loginRouter);
app.use('/api/users', usersRouter);
app.use('/api/blog', tokenExtractor, userExtractor, blogRouter);

app.use(unknownEndpoint);
app.use(errorHandler);

module.exports = app;

const logger = require('./logger');

const requestLogger = (rq, rs, next) => {
  logger.info('Method:', rq.method);
  logger.info('Path:  ', rq.path);
  logger.info('Body:  ', rq.body);
  logger.info('---');
  next();
};

const errorHandler = (error, rq, rs, next) => {
  if (error.name === 'CastError') {
    return rs.status(400).send({ error: 'malformatted id' });
  }

  if (error.name === 'ValidationError') {
    return rs.status(400).json({ error: error.message });
  }

  if (
    error.name === 'MongoServerError' &&
    error.message.includes('E11000 duplicate key error')
  ) {
    return rs
      .status(400)
      .json({ error: 'expected `username` to be unique' });
  }

  if (error.name === 'JsonWebTokenError') {
    return rs.status(401).json({ error: 'token invalid' });
  }

  if (error.name === 'TokenExpiredError') {
    return rs.status(401).json({
      error: 'token expired',
    });
  }

  return next(error);
};

const unknownEndpoint = (rq, rs) => {
  rs.status(404).send({ error: 'unknown endpoint' });
};

module.exports = {
  errorHandler,
  unknownEndpoint,
  requestLogger,
};

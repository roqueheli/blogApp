const jwt = require('jsonwebtoken');

const userExtractor = (rq, rs, next) => {
  if (!rq.headers.authorization) {
    return rs.status(403).send({ error: 'token undefined' });
  }

  const token = rq.headers.authorization.replace('Bearer ', '');
  const decodedToken = jwt.verify(token, process.env.SECRET);
  
  rq.user = decodedToken.id;
  next();
};

module.exports = {
  userExtractor,
};

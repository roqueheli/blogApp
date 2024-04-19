const tokenExtractor = (rq, rs, next) => {
  if (!rq.headers.authorization) {
    return rs.status(403).send({ error: "token undefined" });
  }

  const token = rq.headers.authorization.replace("Bearer ", "");
  rq.token = token;
  next();
};

module.exports = { tokenExtractor, };
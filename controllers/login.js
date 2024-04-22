const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const loginRouter = require('express').Router();
const User = require('../models/users');

loginRouter.post('/', async (rq, rs) => {
  const { username, password } = rq.body;

  const user = await User.findOne({ username });
  const passwordCorrect = user !== null && await bcrypt.compare(password, user.passwordHash);

  if (!(user && passwordCorrect)) {
    return rs.status(401).json({
      error: 'invalid username or password',
    });
  }

  const userForToken = {
    username: user.username,
    id: user._id,
  };

  const token = jwt.sign(userForToken, process.env.SECRET, { expiresIn: 60*60 });

  rs
    .status(200)
    .send({ token, username: user.username, name: user.name, id: user._id });
});

module.exports = loginRouter;

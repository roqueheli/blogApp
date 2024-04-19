const bcrypt = require('bcrypt');
const usersRouter = require('express').Router();
const User = require('../models/users');
const passValidation = require('../utils/passValidation');

//  get all users
usersRouter.get('/', async (rq, rs) => {
  const users = await User.find({}).populate('blogs', { url: 1, tittle: 1, author: 1 });
  return rs.status(200).json(users);
});

//  add a new user
usersRouter.post('/', async (rq, rs) => {
  const { username, name, password } = rq.body;

  const isRight = await passValidation(password);
  !isRight ? rs.status(400).send({ error: 'password must be secure', }) : null;
  
  const passwordHash = await bcrypt.hash(password, 10);
  
  const user = new User({
    username,
    name,
    passwordHash,
  });
  
  const savedUser = await user.save();
  return rs.status(201).json(savedUser);
});

module.exports = usersRouter;

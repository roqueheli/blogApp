const jwt = require('jsonwebtoken');
const blogRouter = require('express').Router();
const BlogApp = require('../models/blogApp');
const User = require('../models/users');

//  get all reviews
blogRouter.get('/', async (rq, rs) => {
  const blog = await BlogApp.find({}).populate('user', {
    username: 1,
    name: 1,
  });
  return rs.status(200).json(blog);
});

//  get one review
blogRouter.get('/:id', async (rq, rs) => {
  const decodedToken = jwt.verify(rq.token, process.env.SECRET);
  const getOneReview = await BlogApp.findOne({ user: decodedToken.id, _id: rq.params.id });

  getOneReview ? rs.status(200).json(getOneReview) : rs.status(403).json({ error: 'unauthorized to see' });
});

//  deleting a review
blogRouter.delete('/:id', async (rq, rs) => {
  const decodedToken = jwt.verify(rq.token, process.env.SECRET);

  if (!decodedToken.id) {
    return rs.status(401).json({ error: 'invalid token' });
  }
  
  const deleteBlog = await BlogApp.findOneAndDelete({ user: decodedToken.id, _id: rq.params.id });
  deleteBlog ? rs.status(204).json(deleteBlog) : rs.status(401).json({ error: 'unauthorized to delete' });
});

//  updating a number of likes
blogRouter.put('/:id', async (rq, rs) => {
  const updatedBlog = await BlogApp.findByIdAndUpdate(rq.params.id, rq.body, {
    new: true,
    runValidators: true,
    context: 'query',
  });
  return rs.status(200).json(updatedBlog);
});

//  add a new review
blogRouter.post('/', async (rq, rs) => {
  const { body } = rq;
  const decodedToken = jwt.verify(rq.token, process.env.SECRET);

  if (!decodedToken.id) {
    return rs.status(401).json({ error: 'invalid token' });
  }

  if (
    !body.tittle ||
    !body.author ||
    !body.url ||
    body.tittle === undefined ||
    body.author === undefined ||
    body.url === undefined
  ) {
    return rs.status(400).json({
      error: 'tittle, author or url is missing',
    });
  }

  const user = await User.findById(decodedToken.id);

  const review = new BlogApp({
    tittle: body.tittle.toUpperCase(),
    author: body.author,
    url: body.url,
    likes: body.likes || 0,
    user: rq.user,
  });

  const savedBlog = await review.save();
  user.blogs = user.blogs.concat(savedBlog._id);
  await user.save();

  return rs.status(201).json(savedBlog);
});

module.exports = blogRouter;

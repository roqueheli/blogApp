const blogRouter = require('express').Router();
const BlogApp = require('../models/blogApp');

//  get all reviews
blogRouter.get('/', async (rq, rs) => {
  const blog = await BlogApp.find({});
  return rs.status(200).json(blog);
});

//  get one review
blogRouter.get('/:id', async (rq, rs) => {
  const getOneReview = await BlogApp.findById(rq.params.id);
  return rs.status(200).json(getOneReview);
});

//  deleting a review
blogRouter.delete('/:id', async (rq, rs) => {
  const deleteBlog = await BlogApp.findByIdAndDelete({ _id: rq.params.id });
  return rs.status(204).json(deleteBlog).end();
});

//  updating a number of likes
blogRouter.put('/:id', async (rq, rs) => {
  const { id, body } = rq;
  const updatedBlog = await BlogApp.findByIdAndUpdate(id, body, { new: true, runValidators: true, context: 'query' });
  return rs.status(200).json(updatedBlog);
});

//  add a new review
blogRouter.post('/', async (rq, rs) => {
  const { body } = rq;

  if (!body.tittle || !body.author || body.tittle === undefined || body.author === undefined) {
    return rs.status(400).json({
      error: 'tittle or author is missing',
    });
  }

  const review = new BlogApp({
    tittle: body.tittle.toUpperCase(),
    author: body.author,
    url: body.url,
    likes: body.likes || 0,
  });

  const savedBlog = await review.save();
  return rs.status(201).json(savedBlog);
});

module.exports = blogRouter;

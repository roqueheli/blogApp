const blogRouter = require('express').Router();
const BlogApp = require('../models/blogApp');

//  get all reviews
blogRouter.get('/', (rq, rs, next) => {
  BlogApp.find({})
    .then((blog) => rs.json(blog))
    .catch((err) => next(err));
});

//  get one review
blogRouter.get('/:id', (rq, rs, next) => {
  BlogApp
    .findById(rq.params.id)
    .then((blogReview) => rs.json(blogReview))
    .catch((err) => next(err));
});

//  deleting a review
blogRouter.delete('/:id', (rq, rs, next) => {
  BlogApp
    .findByIdAndDelete({ _id: rq.params.id })
    .then((blogReview) => rs.json(blogReview))
    .catch((err) => next(err));
});

//  updating a number of likes
blogRouter.put('/:id', (rq, rs, next) => {
  const { id, body } = rq;
  BlogApp
    .findByIdAndUpdate(id, body, { new: true, runValidators: true, context: 'query' })
    .then((blogReview) => rs.json(blogReview))
    .catch((err) => next(err));
});

//  add a new review
blogRouter.post('/', (rq, rs, next) => {
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
    likes: body.likes || 0
  });

  return review
    .save()
    .then((savedPerson) => rs.json(savedPerson))
    .catch((err) => next(err));
});

module.exports = blogRouter;

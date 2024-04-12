const _ = require("lodash");

const dummy = (blogs) => {
  return blogs?.length === 0 ? 1 : blogs.length;
};

const totalLikes = (blogs) => {
  return blogs?.length === 0
    ? 0
    : blogs.reduce((accum, blogs) => {
        return accum + blogs.likes;
      }, 0);
};

const favoriteBlog = (blogs) => {
  return blogs?.length === 0
    ? 0
    : blogs.reduce((accum, blog) => {
        return blog.likes > accum.likes ? blog : accum;
      });
};

const mostBlogs = (blogs) => {
  return _(blogs)
    .groupBy('author')
    .map((items, author) => {
      return {
        author: author,
        blogs: items.length,
      };
    })
    .maxBy((o) => o.blogs)
};

const mostLikes = (blogs) => {
  return blogs?.length === 0
    ? 0
    : blogs.reduce((accum, blog) => {
        return blog.likes > accum.likes
          ? { author: blog.author, likes: blog.likes }
          : { author: accum.author, likes: accum.likes };
      });
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
};

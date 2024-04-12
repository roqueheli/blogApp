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
        return (blog.likes > accum.likes) ? blog : accum
      });
  };

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
};

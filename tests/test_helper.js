const BlogApp = require('../models/blogApp');

const initialBlogs = [
  {
    tittle: 'HARRY POTTER AND THE PHILOSOPHER S STONE',
    author: 'J. K. Rowling',
    url: 'https://imagessl8.casadellibro.com/a/l/s5/98/9781408855898.webp',
    likes: 0,
  },
  {
    tittle: 'HARRY POTTER AND THE CHAMBER OF SECRETS',
    author: 'J. K. Rowling',
    url:
      'https://resizing.flixster.com/p_59aJ4l_XEG6BzswpOW7_3fEaw=/206x305/v2/…',
    likes: 0,
  },
];

const nonExistingId = async () => {
  const blog = new BlogApp({ tittle: 'willremovethissoon' });
  await blog.save();
  await blog.deleteOne();

  return blog.id.toString();
};

const blogsInDb = async () => {
  const blogs = await BlogApp.find({});
  return blogs.map((blog) => blog.toJSON());
};

module.exports = {
  initialBlogs,
  nonExistingId,
  blogsInDb,
};

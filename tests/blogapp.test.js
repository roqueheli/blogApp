const mongoose = require('mongoose');
const supertest = require('supertest');
const { initialBlogs, nonExistingId, blogsInDb } = require('./test_helper');
const BlogApp = require('../models/blogApp');
const app = require('../app');

const api = supertest(app);

beforeEach(async () => {
  await BlogApp.deleteMany({});

  const saveNotes = initialBlogs.map((blog) => new BlogApp(blog));
  const arraySaved = saveNotes.map(blog => blog.save());
  await Promise.all(arraySaved);
});

test('blogs are returned as json', async () => {
  await api
    .get('/api/blog')
    .expect(200)
    .expect('Content-Type', /application\/json/);
}, 10000);

test('there are two blogs', async () => {
  const rs = await api.get('/api/blog');
  expect(rs.body).toHaveLength(2);
});

test('the first blog is about HTTP methods', async () => {
  const rs = await api.get('/api/blog');
  expect(rs.body[0].author).toBe('J. K. Rowling');
});

test('all blogs are returned', async () => {
  const rs = await api.get('/api/blog');

  expect(rs.body).toHaveLength(initialBlogs.length);
});

test('a specific blog is within the returned blogs', async () => {
  const rs = await api.get('/api/blog');
  const contents = rs.body.map((r) => r.author);
  expect(contents).toContain('J. K. Rowling');
});

test('a valid blog can be added', async () => {
  const newBlog = {
    tittle: 'Harry Potter and the Prisoner of Azkaban',
    author: 'J. K. Rowling',
    url:
      'https://cdnx.jumpseller.com/peliculas-de-papel/image/24915969/resize/1280/1280?1654580352',
    likes: 0,
  };

  await api
    .post('/api/blog')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/);

  const rs = await api.get('/api/blog');

  const titles = rs.body.map((r) => r.tittle);

  expect(rs.body).toHaveLength(initialBlogs.length + 1);
  expect(titles).toContain('HARRY POTTER AND THE PRISONER OF AZKABAN');
});

test('blog without content is not added', async () => {
  const newBlog = {
    tittle: 'Not added, author is missing',
    likes: 0,
  };

  await api
    .post('/api/blog')
    .send(newBlog)
    .expect(400)
    .expect('Content-Type', /application\/json/);

  expect(await blogsInDb()).toHaveLength(initialBlogs.length);
});

test('a specific blog can be viewed', async () => {
  const blogsAtStart = await blogsInDb();
  const blogToView = blogsAtStart[0];

  const resultBlog = await api
    .get(`/api/blog/${blogToView.id}`)
    .expect(200)
    .expect('Content-Type', /application\/json/);

  expect(resultBlog.body).toEqual(blogToView);
});

test('a blog can be deleted', async () => {
  const blogsAtStart = await blogsInDb();
  const blogToDelete = blogsAtStart[0];

  await api.delete(`/api/blog/${blogToDelete.id}`).expect(204);
  const blogsAtEnd = await blogsInDb();
  expect(blogsAtEnd).toHaveLength(initialBlogs.length - 1);
  const contents = blogsAtEnd.map((r) => r.tittle);
  expect(contents).not.toContain(blogToDelete.tittle);
});

test('check if property id is defined', async () => {
  const rs = await api.get('/api/blog');
  expect(rs.body[0].author).toBeDefined();
});

afterAll(() => {
  mongoose.connection.close();
});

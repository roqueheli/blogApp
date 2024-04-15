const mongoose = require('mongoose');
const supertest = require('supertest');
const { initialBlogs, nonExistingId, blogsInDb } = require('./test_helper');
const BlogApp = require('../models/blogApp');
const app = require('../app');

const api = supertest(app);

beforeEach(async () => {
  await BlogApp.deleteMany({});

  const saveNotes = initialBlogs.map((blog) => new BlogApp(blog));
  const arraySaved = saveNotes.map((blog) => blog.save());
  await Promise.all(arraySaved);
});

describe('when there is initially some notes saved', () => {
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

  test('the first blog is about J. K. Rowling', async () => {
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

  test('check if property id is defined', async () => {
    const rs = await api.get('/api/blog');
    rs.body.map((blog) => {
      expect(blog.id).toBeDefined();
    });
  });
});

describe('viewing a specific note', () => {
  test('succeeds with a valid id', async () => {
    const blogsAtStart = await blogsInDb();
    const blogToView = blogsAtStart[0];

    const resultBlog = await api
        .get(`/api/blog/${blogToView.id}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);

    expect(resultBlog.body).toEqual(blogToView);
  });

  test('fails with statuscode 400 if id is invalid', async () => {
    const invalidId = '5a3d5da59070081a82a3445';

    await api.get(`/api/blog/${invalidId}`).expect(400);
  });
});

describe('addition of a new note', () => {
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

  test('add a new blog without likes property', async () => {
    const newBlog = {
      tittle: 'Harry Potter and the Goblet of Fire',
      author: 'J. K. Rowling',
      url:
        'https://upload.wikimedia.org/wikipedia/en/c/c9/Harry_Potter_and_the_Goblet_of_Fire_Poster.jpg',
    };

    const rs = await api.post('/api/blog').send(newBlog);

    expect(rs.body.likes).toBe(0);
  });

  test('fails with status code 400 if url property is not provided', async () => {
    const newBlog = {
      tittle: 'Harry Potter and the Order of the Phoenix',
      author: 'J. K. Rowling',
      likes: 0,
    };

    await api.post('/api/blog').send(newBlog).expect(400);
  });

  test('fails with status code 400 if tittle property is not provided', async () => {
    const newBlog = {
      author: 'J. K. Rowling',
      url:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTEZBsvn4Gm2eDVJ3IcOAvrZo9oz8ATmBlfksqqKFaeuw&s',
      likes: 0,
    };

    await api.post('/api/blog').send(newBlog).expect(400);
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
});

describe('deletion of a note', () => {
  test('a blog can be deleted', async () => {
    const blogsAtStart = await blogsInDb();
    const blogToDelete = blogsAtStart[0];

    await api.delete(`/api/blog/${blogToDelete.id}`).expect(204);
    const blogsAtEnd = await blogsInDb();
    expect(blogsAtEnd).toHaveLength(initialBlogs.length - 1);
    const contents = blogsAtEnd.map((r) => r.tittle);
    expect(contents).not.toContain(blogToDelete.tittle);
  });
});

describe('updating a note', () => {
  test('updating number of likes with a valid id', async () => {
    const blogsAtStart = await blogsInDb();
    const blogToUpd = blogsAtStart[1];

    const updBlog = {
      likes: 25,
    };

    await api
      .put(`/api/blog/${blogToUpd.id}`)
      .send(updBlog)
      .expect(200);
    
    const rs = await api
      .get(`/api/blog/${blogToUpd.id}`);

    expect(rs.body.likes).toBe(25)
  });

  test('updating number of likes with a invalid id', async () => {
    const invalidId = '5a3d5da59070081a82a3445';

    const updBlog = {
      likes: 110,
    };

    await api
      .put(`/api/blog/${invalidId}`)
      .send(updBlog)
      .expect(400);
  });
});

afterAll(() => {
  mongoose.connection.close();
});

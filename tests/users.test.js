const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const supertest = require('supertest');
const User = require('../models/users');
const app = require('../app');
const { usersInDb } = require('./test_helper');
const assert = require('assert');

const api = supertest(app);

describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({});

    const passwordHash = await bcrypt.hash('sekret', 10);
    const user = new User({ username: 'root', passwordHash });

    await user.save();
  });

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await usersInDb();

    const newUser = {
      username: 'rarenas27',
      name: 'Matti Luukkainen',
      password: 'Geeks@123.',
    };

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const usersAtEnd = await usersInDb();
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1);

    const usernames = usersAtEnd.map((u) => u.username);
    assert(usernames.includes(newUser.username));
  });

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await usersInDb();

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'Geeks@123',
    };

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    const usersAtEnd = await usersInDb();
    assert(result.body.error.includes('expected `username` to be unique'));

    assert.strictEqual(usersAtEnd.length, usersAtStart.length);
  });

  test('creation fails with proper statuscode and message if username is too short', async () => {
    const newUser = {
      username: 'roo',
      name: 'Superuser',
      password: 'Geeks@123',
    };

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    assert(result.body.error.includes('User validation failed: username: username too short'));
  });

  test('creation fails with proper statuscode and message if password is not secure', async () => {
    const newUser = {
      username: 'dodgers',
      name: 'Superuser',
      password: 'Cr8st8n1',
    };

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    assert(result.body.error.includes('password must be secure'));
  });

  test('creation fails with a invalid username', async () => {
    const newUser = {
      username: 'rarenas@7',
      name: 'Matti Luukkainen',
      password: 'Geeks@123.',
    };

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    assert(result.body.error.includes(`User validation failed: username: ${newUser.username} contains invalid characters!`));
  });

  afterAll(() => {
    mongoose.connection.close();
  });
});


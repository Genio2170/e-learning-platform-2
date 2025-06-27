// tests/auth.test.js
const request = require('supertest');
const app = require('../app');
const User = require('../models/User');

describe('Auth System', () => {
  beforeAll(async () => {
    await User.deleteMany({});
  });

  test('Register new user', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({
        fullName: 'Test User',
        idNumber: '123456789',
        phone: '123456789',
        email: 'test@example.com',
        address: 'Test Address',
        class: 'Test Class',
        password: 'password123',
        confirmPassword: 'password123'
      });
    
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('token');
    
    const user = await User.findOne({ email: 'test@example.com' });
    expect(user).not.toBeNull();
    expect(user.fullName).toBe('Test User');
  });

  test('Login with valid credentials', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('token');
  });
});
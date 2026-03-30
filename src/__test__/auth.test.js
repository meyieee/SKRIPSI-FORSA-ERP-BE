const supertest = require('supertest')
const sequelize = require('./setupTests')
const app = require('../app.js');

const user1 = { email: 'user1@gmail.com', password: 'user1' };

beforeAll(async () => {
  console.log('Syncing database...');
  await sequelize.sync({ force: true }); // This will create the tables
  console.log('Database synced.');
});

afterAll(async () => {
  console.log('Closing database connection...');
  await sequelize.close();
  console.log('Database connection closed.');
});

beforeEach(async () => {
  console.log('Clearing user table before each test...');
  console.log('User table cleared.');
});

describe('Auth Controller', () => {
  describe('login', () => {
    it('should return 201', async () => {
      const response = await supertest(app).post('/api/users/login').send(user1);
      const body = response.body;
      console.log("body:",body)
      expect(response.status).toBe(200);
    });
  });
});

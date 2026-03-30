const supertest = require('supertest');
const sequelize = require('./setupTests');
const app = require('../app.js');
const UOM = require("../models/scm_cf_00_uoms")

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
  console.log('Clearing relevant tables before each test...');
  // Optionally clear other relevant tables here
  console.log('Relevant tables cleared.');
});

describe('Uom Controller', () => {
    // NOTE: describe & it can use .skip (e.g. describe.skip || it.skip)
    describe.skip('create UOM', () => {
        it('should return 200', async () => {
            const user1 = { email: 'user1@gmail.com', password: 'user1' };

            await UOM.destroy({ where: {}});
            const user = await supertest(app).post('/api/users/login').send(user1);
            const userToken = user.body.token;
            const user_id = user.body.id_number;
            const addUom = { uom_code: 'gr', uom_description: 'gram', reg_by: user_id, status: true, remarks: ''};
               // Create the UOM and capture the response
            const response = await supertest(app).post('/api/uom').set('Authorization', `Bearer ${userToken}`).send(addUom);
            // Assert the response status
            expect(response.status).toBe(200);
            // Assert the response message
            expect(response.body.message).toBe('Successfully created data.');
        });
        it('should return 409', async () => {
            const user1 = { email: 'user1@gmail.com', password: 'user1' };
            
            const user = await supertest(app).post('/api/users/login').send(user1);
            const userToken = user.body.token;
            const user_id = user.body.id_number;
            const addUom = { uom_code: 'gr', uom_description: 'gram', reg_by: user_id, status: true, remarks: ''};
               // Create the UOM and capture the response
            const response = await supertest(app).post('/api/uom').set('Authorization', `Bearer ${userToken}`).send(addUom);
            // Assert the response status
            expect(response.status).toBe(409);
            // Assert the response message
            expect(response.body.message).toBe('uom already exists.');
        });
    });

  describe('create UOM with concurrent request from multiple users', () => {
    it('should receive just an uom', async () => {
      const user1 = { email: 'user1@gmail.com', password: 'user1' };
      const user2 = { email: 'user2@gmail.com', password: 'user2' };

      const user1Login = await supertest(app).post('/api/users/login').send(user1);
      const user2Login = await supertest(app).post('/api/users/login').send(user2);

      const user1Token = user1Login.body.token;
      const user2Token = user2Login.body.token;

      const addUom1 = { uom_code: '146746349m', uom_description: 'kilo meter', reg_by: 'user1', status: true, remarks: ''};
      const addUom2 = { uom_code: '146746349m', uom_description: 'kilo meter', reg_by: 'user2', status: true, remarks: ''};

      const createUomRequests = [
        supertest(app)
          .post('/api/uom')
          .set('Authorization', `Bearer ${user1Token}`)
          .send(addUom1),

        supertest(app)
          .post('/api/uom')
          .set('Authorization', `Bearer ${user2Token}`)
          .send(addUom2)
      ];

      const responses = await Promise.all(createUomRequests);

      const successfulResponses = responses.filter(response => response.status === 200);

      // For example, expect only one successful creation and the rest to be conflicts
      expect(successfulResponses.length).toBe(1);
    });
  });
});

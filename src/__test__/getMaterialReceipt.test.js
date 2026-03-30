const supertest = require('supertest');
const sequelize = require('./setupTests');
const app = require('../app.js');
const MatTrans = require("../models/tbl_mat_trans")
const { material_receive } = require('../constants');

beforeAll(async () => {
  await sequelize.sync({ force: true }); // This will create the tables
});

afterAll(async () => {
  await sequelize.close();
});

beforeEach(async () => {
});

describe('Stock On Hand Controller', () => {
    // NOTE: describe & it can use .skip (e.g. describe.skip || it.skip)
    describe.skip('get Material Receipt (HO)', () => {
        it.skip('Should return 200 and get the latest transaction by id for every stock_code in each storage within a branch', async () => {
          const user1 = { email: 'user1@gmail.com', password: 'user1' };
          const user = await supertest(app).post('/api/users/login').send(user1);
          const userToken = user.body.token;
          const response = await supertest(app).get('/api/materialreceives').set('Authorization', `Bearer ${userToken}`)
          const resposeBodyData = response.body.data;
          const fetchMatTransData = await MatTrans.findAll({
            where: {
              trans_type: material_receive,
            },
            raw: true,
            order: [['id', 'DESC']],

            attributes: [
                'id',
                'doc_no',
                'doc_ref_no',
                'item_no',
                'branch',
                'item_id',
                'stock_code',
                'trans_type',
                'qty',
                'qty_in',
                'qty_out',
                'qty_bal',
                'balance',
                'storage',
            ]
          })

          // Accumulate data using a composite key
          const result = fetchMatTransData.reduce((acc, record) => {
              const key = `${record.stock_code}-${record.storage}-${record.branch}`;
              if (!acc[key]) {
              acc[key] = {
                  ...record,
                  total_qty_in: 0,
              };
              }
              acc[key].total_qty_in += record.qty_in;
              return acc;
          }, {});
          
          const filteredResult = Object.keys(result).reduce((acc, key) => {
              if (result[key].total_qty_in !== result[key].qty) {
              acc[key] = result[key];
              }
              return acc;
          }, {});
          
          resposeBodyData.forEach((item) => {
          const key = `${item.stock_code}-${item.storage}-${item.branch}`;
            expect(item.id).toBe(filteredResult[key].id);
          });
          
          expect(response.status).toBe(200);
        });
    });

    describe.skip('get Material Receipt (Branch)', () => {
      it('Should return 200 and get the latest transaction by id for every stock_code in each storage within a branch', async () => {
        const user1 = { email: 'user1@gmail.com', password: 'user1' };
        const user = await supertest(app).post('/api/users/login').send(user1);
        const userToken = user.body.token;
        const branch_code = user.body.user['adm_cf_00_com.branch_code']
        const response = await supertest(app).get(`/api/materialreceives/${branch_code}`).set('Authorization', `Bearer ${userToken}`)
        const resposeBodyData = response.body.data;
        const fetchMatTransData = await MatTrans.findAll({
          where: {
            trans_type: material_receive,
          },
          raw: true,
          order: [['id', 'DESC']],

          attributes: [
              'id',
              'doc_no',
              'doc_ref_no',
              'item_no',
              'branch',
              'item_id',
              'stock_code',
              'trans_type',
              'qty',
              'qty_in',
              'qty_out',
              'qty_bal',
              'balance',
              'storage',
          ]
        })

        // Accumulate data using a composite key
        const result = fetchMatTransData.reduce((acc, record) => {
            const key = `${record.stock_code}-${record.storage}-${record.branch}`;
            if (!acc[key]) {
            acc[key] = {
                ...record,
                total_qty_in: 0,
            };
            }
            acc[key].total_qty_in += record.qty_in;
            return acc;
        }, {});
        
        const filteredResult = Object.keys(result).reduce((acc, key) => {
            if (result[key].total_qty_in !== result[key].qty) {
            acc[key] = result[key];
            }
            return acc;
        }, {});
        
        resposeBodyData.forEach((item) => {
        const key = `${item.stock_code}-${item.storage}-${item.branch}`;
          expect(item.id).toBe(filteredResult[key].id);
        });
        
        expect(response.status).toBe(200);
      });
    });
});
const supertest = require('supertest');
const sequelize = require('./setupTests');
const app = require('../app.js');
const MatTrans = require("../models/tbl_mat_trans")
const { material_receive, request, reservation } = require('../constants');

beforeAll(async () => {
  await sequelize.sync({ force: true }); // This will create the tables
});

afterAll(async () => {
  await sequelize.close();
});

beforeEach(async () => {
  // Optionally clear other relevant tables here
});

describe('Stock On Hand Controller', () => {
    // NOTE: describe & it can use .skip (e.g. describe.skip || it.skip)
    describe('get Stock On Hand (HO)', () => {

        // masih kurang tepat test ini
        it.skip('Should return 200 and get the latest transaction for every stock_code in each storage within a branch', async () => {
          const user1 = { email: 'user1@gmail.com', password: 'user1' };
          const user = await supertest(app).post('/api/users/login').send(user1);
          const userToken = user.body.token;
          const response = await supertest(app).get('/api/stocksonhand').set('Authorization', `Bearer ${userToken}`)
          const resposeBodyData = response.body.data;
          const findStockOnHand = await MatTrans.findAll({raw: true})

          //1. harus transaksi terakhir dari setiap stockcode pada masing masing storage yang memiliki branch unik (lihat id terakhir dan date terkini)
          const lastTransactions = findStockOnHand.reduce((acc, current) => {
            const key = `${current.stock_code}-${current.storage}-${current.branch}`;
            if (!acc[key]) {
              acc[key] = current;
            } else {
              const currentDate = new Date(current.date);
              const existingDate = new Date(acc[key].date);
          
              if (currentDate > existingDate || (currentDate.getTime() === existingDate.getTime())) {
                acc[key] = current;
              }
            }
            return acc;
          }, {});
      
          const result = JSON.parse(JSON.stringify(lastTransactions));//parse ke json agar mendapatkan date as string. karna res.body itu format json
          
          resposeBodyData.forEach((item, index) => {
            const key = `${item.stock_code}-${item.storage}-${item.branch}`;
              expect(item.id).toBe(result[key].id); // Pastikan id-nya sama
              expect(item.date).toBe(result[key].date); // Pastikan datenya sama
          });
          expect(response.status).toBe(200);
        });

        it('Should return 200 and correctly accumulate true value of qty_bal and balance in every stock_code within each storage', async () => {
            const user1 = { email: 'user1@gmail.com', password: 'user1' };
            const user = await supertest(app).post('/api/users/login').send(user1);

            const userToken = user.body.token;
            const response = await supertest(app).get('/api/stocksonhand').set('Authorization', `Bearer ${userToken}`)
            const resposeBodyData = response.body.data;

            const findStockOnHand = await MatTrans.findAll({raw: true})
            findStockOnHand.sort((a, b) => new Date(a.date) - new Date(b.date));

           //2. qty_bal pada transaksi terakhir stock_code pada suatu storage harus sama dengan akumulasi qty_in stock_code pada storage tersebut
           const accumulateQtyInOut = (data) => {
            const result = {qty_bal:{}, balance:{}};

            data.forEach(item => {
              const { branch, storage, stock_code, qty_in, qty_out } = item;
              
              // Buat key untuk kombinasi stock_code, branch, dan storage
              const keyQtyBal = `${stock_code}-${storage}-${branch}`;
              const keyBal = `${stock_code}-${branch}`;
              
              if (!result.qty_bal[keyQtyBal]) {
                result.qty_bal[keyQtyBal] = { qty_in: 0, qty_out: 0 };
              }
              
              if (!result.balance[keyBal]) {
                result.balance[keyBal] = { qty_in: 0, qty_out: 0 };
              }

              result.qty_bal[keyQtyBal].qty_in += qty_in;
              result.qty_bal[keyQtyBal].qty_out += qty_out;
             
              result.balance[keyBal].qty_in += qty_in;
              result.balance[keyBal].qty_out += qty_out;
            });

            // Kurangi qty_in dengan qty_out untuk setiap keyQtyBal
            for (const keyQtyBal in result.qty_bal) {
              result.qty_bal[keyQtyBal] = result.qty_bal[keyQtyBal].qty_in - result.qty_bal[keyQtyBal].qty_out;
            }
            
            for (const keyBal in result.balance) {
              result.balance[keyBal] = result.balance[keyBal].qty_in - result.balance[keyBal].qty_out;
            }

            return result;
          };

          resposeBodyData.forEach((item) => {
            const key = `${item.stock_code}-${item.storage}-${item.branch}`;
            expect(item.qty_bal).toBe(accumulateQtyInOut(findStockOnHand).qty_bal[key]);
          });

          // Pengecekan apakah semua accumulateQtyInOut cocok dengan responseBodyData
          const allMatching = Object.entries(accumulateQtyInOut(findStockOnHand).balance).every(([key, value]) => {
            return resposeBodyData.some(item => `${item.stock_code}-${item.branch}` === key && item.balance === value);
          });
          
          expect(allMatching).toBe(true);
          expect(response.status).toBe(200);
        });
    });

    describe('get Stock On Hand (By Branch)', () => {
        it('Should return 200 and get the latest transaction for every stock_code in each storage within a branch', async () => {
          const user1 = { email: 'edson@gmail.com', password: '1234' };
          const user = await supertest(app).post('/api/users/login').send(user1);
          const branch_code = user.body.user['adm_cf_00_com.branch_code']
          const userToken = user.body.token;
          const response = await supertest(app).get(`/api/stocksonhand/${branch_code}`).set('Authorization', `Bearer ${userToken}`)
          const resposeBodyData = response.body.data;
          const findStockOnHand = await MatTrans.findAll({ where: {branch: branch_code},raw: true})

          //1. harus transaksi terakhir dari setiap stockcode pada masing masing storage yang memiliki branch unik (lihat id terakhir dan date terkini)
          const lastTransactions = findStockOnHand.reduce((acc, current) => {
            const key = `${current.stock_code}-${current.storage}-${current.branch}`;
            if (!acc[key]) {
              acc[key] = current;
            } else {
              const currentDate = new Date(current.date);
              const existingDate = new Date(acc[key].date);
          
              if (currentDate > existingDate || (currentDate.getTime() === existingDate.getTime())) {
                acc[key] = current;
              }
            }
            return acc;
          }, {});
          const result = JSON.parse(JSON.stringify(lastTransactions));//parse ke json agar mendapatkan date as string. karna res.body itu format json
         
          resposeBodyData.forEach((item, index) => {
            const key = `${item.stock_code}-${item.storage}-${item.branch}`;
              expect(item.id).toBe(result[key].id); // Pastikan id-nya sama
              expect(item.date).toBe(result[key].date); // Pastikan datenya sama
          });

          expect(response.status).toBe(200);
        });

        it('Should return 200 and correctly accumulate qty_in - qty_out for every stock_code within each storage', async () => {
          const user1 = { email: 'user1@gmail.com', password: 'user1' };
          const user = await supertest(app).post('/api/users/login').send(user1);
          const branch_code = user.body.user['adm_cf_00_com.branch_code']

          const userToken = user.body.token;
          const response = await supertest(app).get(`/api/stocksonhand/${branch_code}`).set('Authorization', `Bearer ${userToken}`)
          const resposeBodyData = response.body.data;

          const findStockOnHand = await MatTrans.findAll({where:{branch: branch_code}, raw: true})

        //2. qty_bal pada transaksi terakhir stock_code pada suatu storage harus sama dengan akumulasi qty_in stock_code pada storage tersebut
          const accumulateQtyInOut = (data) => {
            const result = {};

            data.forEach(item => {
              const { branch, storage, stock_code, qty_in, qty_out } = item;
              
              // Buat key untuk kombinasi stock_code, branch, dan storage
              const key = `${stock_code}-${storage}-${branch}`;
              
              if (!result[key]) {
                result[key] = { qty_in: 0, qty_out: 0 };
              }

              result[key].qty_in += qty_in;
              result[key].qty_out += qty_out;
            });

            // Kurangi qty_in dengan qty_out untuk setiap key
            for (const key in result) {
              result[key] = result[key].qty_in - result[key].qty_out;
            }

            return result;
          };

          const accumulatedQtyInOut = accumulateQtyInOut(findStockOnHand);
          resposeBodyData.forEach((item) => {
            const key = `${item.stock_code}-${item.storage}-${item.branch}`;
            expect(item.qty_bal).toBe(accumulatedQtyInOut[key]);
          });
          expect(response.status).toBe(200);
        })
    });
            
    describe('calculate qty_bal/balance and cost price average (manual)', () => { 
      it('correctly accumulate stock value and cost_price_average for every stock_code within each storage', async () => {
        let findStockOnHand = await MatTrans.findAll({ raw: true });
        findStockOnHand.sort((a, b) => new Date(a.date) - new Date(b.date));
        validateStockValues(findStockOnHand);
      });
      it('correctly accumulate qty_bal/balance for every stock_code within each storage', async () => {
        let findStockOnHand = await MatTrans.findAll({ raw: true });
        findStockOnHand.sort((a, b) => new Date(a.date) - new Date(b.date));
        validateStockQuantities(findStockOnHand);
      });
      it('correctly sets unit_price in MI from the latest stock_price_average for each stock_code within each storage', async () => {
        let findStockOnHand = await MatTrans.findAll({ raw: true });
        findStockOnHand.sort((a, b) => new Date(a.date) - new Date(b.date));
        validateUnitPrice(findStockOnHand);
      });
    })
});

function validateStockValues(data) {
  const previousStockValues = {};
  for (let i = 0; i < data.length; i++) {
    const { stock_code, storage, branch, amount, stock_value, unit_price, qty_bal, rate, qty_out, qty_in, cost_price_average, trans_type, id } = data[i];

    const key = `${stock_code},${storage},${branch}`;

    const expectedAmount = ((qty_out || qty_in) * rate * unit_price).toFixed(2);
    const actualAmount = amount.toFixed(2);
    const marginTolerance = 0.1;

    // console.log(`
    //   actualAmount: ${actualAmount}
    //   id: ${id}

    //   expectedAmount: ${expectedAmount}
    //   `)    

    expect(parseFloat(expectedAmount)).toBeGreaterThanOrEqual(parseFloat(actualAmount) - marginTolerance);
    expect(parseFloat(expectedAmount)).toBeLessThanOrEqual(parseFloat(actualAmount) + marginTolerance);

    // Validate stock_value calculation
    if (previousStockValues[key] !== undefined) {
      // Calculate adjusted stock value based on the transaction type
    
      const expectedStockValue =(
                                  trans_type === material_receive ? 
                                  amount + previousStockValues[key] 
                                  : 
                                  previousStockValues[key] - amount
                                ).toFixed(2);

      const actualStockValue = stock_value.toFixed(2);
      
      // Calculate the expected cost price average
      const expectedCostPriceAverage = (qty_bal > 0 ? expectedStockValue / qty_bal : 0).toFixed(2);
      const actualCostPriceAverage = cost_price_average.toFixed(2);

      // console.log(`
      //   actualStockValue: ${actualStockValue}
      //   id: ${id}

      //   expectedStockValue: ${expectedStockValue}
      //   `)

      expect(expectedStockValue).toBe(actualStockValue); // expect stock value
      expect(expectedCostPriceAverage).toBe(actualCostPriceAverage); // expect cost price average

      // Update the previous value for this key
      previousStockValues[key] = stock_value;
    } else {
      // If it's the first element with this stock_code, storage, and branch, assume the stock_value is correct
      previousStockValues[key] = stock_value;
    }
  }
}

function validateStockQuantities(data) {
  // Track the running balance and quantity balance for each (stock_code, storage, branch) key
  const qtyBalMap = {};
  const balanceMap = {};

  data.forEach((item) => {
    const { stock_code, storage, branch, qty_in, qty_out, qty_bal, balance } = item;
    const key = `${stock_code},${storage},${branch}`;
    const branchKey = `${stock_code},${branch}`;

    // Validate qty_bal
    if (qtyBalMap[key] !== undefined) {
      const expectedQtyBal = qtyBalMap[key] + qty_in - qty_out;
      expect(qty_bal).toBe(expectedQtyBal);
      // Update the running balance for this key
      qtyBalMap[key] = expectedQtyBal;
    } else {
      // Initialize the map if it's the first entry for this key
      qtyBalMap[key] = qty_in - qty_out;
      expect(qty_bal).toBe(qtyBalMap[key]);
    }

    // Validate balance
    if (balanceMap[branchKey] !== undefined) {
      const expectedBalance = balanceMap[branchKey] + qty_in - qty_out;
      expect(balance).toBe(expectedBalance);
      // Update the running balance for this key
      balanceMap[branchKey] = expectedBalance;
    } else {
      // Initialize the map if it's the first entry for this key
      balanceMap[branchKey] = qty_in - qty_out;
      expect(balance).toBe(balanceMap[branchKey]);
    }
  });
}

function validateUnitPrice(data) {
  // console.log("data:",data)
  const latestCostPriceAverage = {};

  for (let i = 0; i < data.length; i++) {
    const { stock_code, storage, unit_price, cost_price_average, branch, trans_type, id } = data[i];

    const key = `${stock_code},${storage},${branch}`;
    
    const actualUnitPrice = unit_price.toFixed(2);

    if(trans_type === material_receive){
      latestCostPriceAverage[key] = {
        value: cost_price_average,
        id: id
      }
      continue;
    }

    // console.log(`
    //   latestCostPriceAverage[key]: ${latestCostPriceAverage[key].value}, id:${latestCostPriceAverage[key].id}
    //   actualUnitPrice: ${actualUnitPrice}, id: ${id}
    //   `)
    
      // expect(latestCostPriceAverage[key].value.toFixed(2)).toBe(actualUnitPrice)
      const expectedValue = latestCostPriceAverage[key].value.toFixed(2);
      const isMatch = expectedValue === actualUnitPrice;

      expect(isMatch).toBe(true);
      if (isMatch) {
        latestCostPriceAverage[key] = {
          value: cost_price_average,
          id: id
        }
      }

  }
}
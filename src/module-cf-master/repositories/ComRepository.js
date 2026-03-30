const Com = require('../models/adm_cf_00_coms');
const { company } = require('../../constants');

module.exports = {
    postComByFirstRegisterUserRepository: async (payload, transaction) => {
        const { branch_code, com_name, id_number } = payload;
        await Com.create(
          {
            com_code: branch_code,
            com_name,
            com_type: company,
            req_by: id_number,
            status: true,
            status_date: new Date(),
          },
          { transaction }
        );
      },

      checkingExistingCompanyRepository : async () => {
        return await Com.findAll()
      }
};
'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('tbl_mat_reqs', {
      id: {
        type: Sequelize.INTEGER(11),
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      request_no: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      request_date: {
        type: Sequelize.DATE(6),
        allowNull: false,
      },
      requestor: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      trans_type: {
        type: Sequelize.STRING(12),
        allowNull: false,
      },
      branch: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      storage: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      cost_center: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      work_order: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      account_code: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      req_justification: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      delivery_instruction: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      amount: {
        type: Sequelize.INTEGER(20),
        allowNull: false,
      },
      request_status: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      approved_by: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      approved_date: {
        type: Sequelize.DATE(6),
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE(6),
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE(6),
        allowNull: false,
      },
    });
  },

  down: (queryInterface, Sequelize) => {
   return queryInterface.dropTable('tbl_mat_reqs');
  }
};
'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('tbl_mat_req_det', {
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
      item_no: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      stock_code: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      qty_request: {
        type: Sequelize.INTEGER(6),
        allowNull: false,
      },
      qty_issued: {
        type: Sequelize.INTEGER(6),
        allowNull: false,
      },
      price: {
        type: Sequelize.INTEGER(6),
        allowNull: false,
      },
      amount: {
        type: Sequelize.INTEGER(6),
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
   return queryInterface.dropTable('tbl_mat_req_det');
  }
};
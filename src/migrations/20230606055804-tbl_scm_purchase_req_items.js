'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('tbl_scm_purchase_req_items', {
      id: {
        type: Sequelize.INTEGER(11),
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      pr_no: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      item_no: {
        type: Sequelize.STRING(8),
        allowNull: false,
      },
      stock_code: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      qty_request: {
        type: Sequelize.INTEGER(20),
        allowNull: false,
      },
      estimate_price: {
        type: Sequelize.INTEGER(20),
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
   return queryInterface.dropTable('tbl_scm_purchase_req_items');
  }
};
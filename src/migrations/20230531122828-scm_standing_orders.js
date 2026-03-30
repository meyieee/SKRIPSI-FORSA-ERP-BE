'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('scm_standing_orders', {
      id: {
        type: Sequelize.INTEGER(11),
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      stock_code: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      trans_date: {
        type: Sequelize.DATE(6),
        allowNull: false,
      },
      ref_doc_no: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      originator: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      qty_request: {
        type: Sequelize.INTEGER(10),
        allowNull: false,
      },
      estimate_price: {
        type: Sequelize.INTEGER(20),
        allowNull: false,
      },
      justification: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      storage: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      supplier: {
        type: Sequelize.STRING(20),
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
   return queryInterface.dropTable('scm_standing_orders');
  }
};
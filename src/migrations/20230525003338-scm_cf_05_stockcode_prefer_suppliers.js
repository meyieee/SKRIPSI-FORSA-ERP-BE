'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('scm_cf_05_supplier_stockcodes', {
      id: {
        type: Sequelize.INTEGER(11),
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      stock_code: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      supplier_code: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      description: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      uom: {
        type: Sequelize.INTEGER(10),
        allowNull: false,
      },
      uom_measure: {
        type: Sequelize.INTEGER(10),
        allowNull: false,
      },
      remarks: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      is_prefer: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      reg_by: {
        type: Sequelize.STRING(12),
        allowNull: false,
      },
      remarks: {
        type: Sequelize.STRING(200),
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
   return queryInterface.dropTable('scm_cf_05_supplier_stockcodes');
  }
};
'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('adm_cf_15_currency', {
      id: {
        type: Sequelize.INTEGER(11),
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      currency: {
        type: Sequelize.STRING(3),
        allowNull: false,
      },
      currency_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      reg_by:{
        type: Sequelize.STRING(12),
        allowNull: false,
      },
      status:{
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      status_date:{
        type: Sequelize.DATE(6),
        allowNull: false,
      },
      remarks: {
        type: Sequelize.STRING(250),
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
   return queryInterface.dropTable('adm_cf_15_currency');
  }
};

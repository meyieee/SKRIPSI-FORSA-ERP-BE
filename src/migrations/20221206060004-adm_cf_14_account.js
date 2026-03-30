'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('adm_cf_14_account', {
      id: {
        type: Sequelize.INTEGER(11),
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      account_no: {
        type: Sequelize.STRING(25),
        allowNull: false,
      },
      account_name: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      account_type:{
        type: Sequelize.STRING(25),
        allowNull: false,
      },
      account_group:{
        type: Sequelize.STRING(25),
        allowNull: false,
      },
      normally:{
        type: Sequelize.STRING(5),
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
      reg_by: {
        type: Sequelize.STRING(12),
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
   return queryInterface.dropTable('adm_cf_14_account');
  }
};

'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('adm_cf_21_officers', {
      id: {
        type: Sequelize.INTEGER(11),
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      id_number: {
        type: Sequelize.STRING(12),
        allowNull: false,
      },
      full_name: {
        type: Sequelize.STRING(75),
        allowNull: false,
      },
      officer_title: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      officer_qualification: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      officer_type: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      full_address: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      office_phone: {
        type: Sequelize.STRING(30),
        allowNull: false,
      },
      mobile: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      wa: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      photo: {
        type: Sequelize.STRING(250),
        allowNull: false,
      },
      remarks: {
        type: Sequelize.STRING(250),
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
   return queryInterface.dropTable('adm_cf_21_officers');
  }
};

'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('adm_cf_com_a_det', {
      id: {
        type: Sequelize.INTEGER(11),
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      ComCode: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      BillTo:{
        type: Sequelize.STRING(75),
        allowNull: false,
      },
      BillToAddress:{
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      BillToContact:{
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      ShipTo:{
        type: Sequelize.STRING(75),
        allowNull: false,
      },
      ShipToAddress:{
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      ShipToContact:{
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      RegBy:{
        type: Sequelize.STRING(12),
        allowNull: false,
      },
      RegDate:{
        type: Sequelize.DATE(6),
        allowNull: false,
      },
      Status:{
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      StatusDate:{
        type: Sequelize.DATE(6),
        allowNull: false,
      },
      Remarks: {
        type: Sequelize.STRING(250),
        // allowNull: false,
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
   return queryInterface.dropTable('adm_cf_com_a_det');
  }
};

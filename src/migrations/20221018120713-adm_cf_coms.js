'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('adm_cf_com', {
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
      ComName: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      ComShortName: {
        type: Sequelize.STRING(20),
        // allowNull: false,
      },
      ComDes: {
        type: Sequelize.STRING(255),
        // allowNull: false,
      },
      ComType: {
        type: Sequelize.STRING(25),
        allowNull: false,
      },
      Address: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      City: {
        type: Sequelize.STRING(40),
        // allowNull: false,
      },
      Province: {
        type: Sequelize.STRING(300),
        allowNull: false,
      },
      PostalCode: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      Country: {
        type: Sequelize.STRING(30),
        allowNull: false,
      },
      Region: {
        type: Sequelize.STRING(30),
        allowNull: false,
      },
      PhoneNo: {
        type: Sequelize.STRING(75),
        allowNull: false,
      },
      ContactNo: {
        type: Sequelize.STRING(30),
        allowNull: false,
      },
      ContactName: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      NPWP: {
        type: Sequelize.STRING(30),
        // allowNull: false,
      },
      Logo: {
        type: Sequelize.STRING(50),
      },
      Email: {
        type: Sequelize.STRING(75),
        allowNull: false,
      },
      WebAddress: {
        type: Sequelize.STRING(75),
        // allowNull: false,
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
   return queryInterface.dropTable('adm_cf_com');
  }
};

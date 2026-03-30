'use strict';


module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('adm_cf_01_contacts', {
      id: {
        type: Sequelize.INTEGER(3),
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      ComCode: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      IDNumber:{
        type: Sequelize.STRING(12),
        allowNull: false,
      },
      FirstName:{
        type: Sequelize.STRING(25),
        allowNull: false,
      },
      LastName:{
        type: Sequelize.STRING(25),
        allowNull: false,
      },
      ContactTitle:{
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      ContactQualification:{
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      IsPrefer:{
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      FullAddress:{
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      OfficePhone:{
        type: Sequelize.STRING(30),
        allowNull: false,
      },
      Mobile:{
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      WA:{
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      FaxNumber:{
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      Email:{
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      Photo:{
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      RegBy:{
        type: Sequelize.STRING(12),
        allowNull: false,
      },
      RegDate:{
        type: Sequelize.STRING(50),
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
   return queryInterface.dropTable('adm_cf_01_contacts');
  }
};

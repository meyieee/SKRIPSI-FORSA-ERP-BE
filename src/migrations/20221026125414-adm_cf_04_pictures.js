'use strict';


module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('adm_cf_04_pictures', {
      id: {
        type: Sequelize.INTEGER(11),
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      com_code: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      pic_code:{
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      pic_des:{
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      image:{
        type: Sequelize.STRING(100),
        // allowNull: false,
      },   
      remarks: {
        type: Sequelize.STRING(250),
        // allowNull: false,
      },
      status:{
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      status_date:{
        type: Sequelize.DATE(6),
        allowNull: false,
      },
      reg_by:{
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
   return queryInterface.dropTable('adm_cf_04_pictures');
  }
};

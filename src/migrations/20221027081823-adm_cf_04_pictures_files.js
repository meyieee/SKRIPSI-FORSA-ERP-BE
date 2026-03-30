'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('adm_cf_04_pictures_files', {
      id: {
        type: Sequelize.INTEGER(11),
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      picture_id:{
        type: Sequelize.STRING(15),
        allowNull: false
      },
      file_url: {
        type: Sequelize.STRING(100),
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
   return queryInterface.dropTable('adm_cf_04_pictures_files');
  }
};

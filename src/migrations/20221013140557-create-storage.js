'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('storages', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      branch_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'branches', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      code: {
        type: Sequelize.STRING,
        // allowNull: true,
      },
      name:{
        type: Sequelize.STRING,
      },
      address: {
        type: Sequelize.STRING,
        // allowNull: false,
      },
      contact: {
        type: Sequelize.STRING,
        // allowNull: false,
      },
      phoneno: {
        type: Sequelize.STRING,
        // allowNull: false,
      },
      fax: {
        type: Sequelize.STRING,
        // allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        // allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      }
    });
  },

  down: (queryInterface, Sequelize) => {
   return queryInterface.dropTable('storages');
  }
};

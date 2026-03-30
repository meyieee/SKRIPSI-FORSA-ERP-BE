'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('company_profiles', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      code: {
        type: Sequelize.STRING,
        // allowNull: true,
      },
      name: {
        type: Sequelize.STRING,
        // allowNull: true,
      },
      shortname: {
        type: Sequelize.STRING,
        // allowNull: false,
      },
      description: {
        type: Sequelize.STRING,
        // allowNull: false,
      },
      type: {
        type: Sequelize.STRING,
        // allowNull: false,
      },
      address: {
        type: Sequelize.STRING,
        // allowNull: false,
      },
      city: {
        type: Sequelize.STRING,
        // allowNull: false,
      },
      province: {
        type: Sequelize.STRING,
        // allowNull: false,
      },
      postalcode: {
        type: Sequelize.STRING,
        // allowNull: false,
      },
      country: {
        type: Sequelize.STRING,
        // allowNull: false,
      },
      region: {
        type: Sequelize.STRING,
        // allowNull: false,
      },
      phone: {
        type: Sequelize.STRING,
        // allowNull: false,
      },
      contact: {
        type: Sequelize.STRING,
        // allowNull: false,
      },
      contactname: {
        type: Sequelize.STRING,
        // allowNull: false,
      },
      npwp: {
        type: Sequelize.STRING,
        // allowNull: false,
      },
      logo: {
        type: Sequelize.STRING,
      },
      email: {
        type: Sequelize.STRING,
        // allowNull: false,
      },
      webaddress: {
        type: Sequelize.STRING,
        // allowNull: false,
      },
      remarks: {
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
    return queryInterface.dropTable('company_profiles');

  }
};

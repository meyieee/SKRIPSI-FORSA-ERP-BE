'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('tbl_emp_mas_01_types', {
      id: {
        type: Sequelize.INTEGER(11),
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      emp_type: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      emp_type_des: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      disc: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      reg_by: {
        type: Sequelize.STRING(12),
        allowNull: false,
      },
      reg_date: {
        type: Sequelize.DATE(6),
        allowNull: false,
      },
      remarks: {
        type: Sequelize.STRING(200),
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
   return queryInterface.dropTable('tbl_emp_mas_01_types');
  }
};
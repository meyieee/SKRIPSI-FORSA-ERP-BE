'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('tbl_scm_purchase_reqs', {
      id: {
        type: Sequelize.INTEGER(11),
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      pr_no: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      pr_date: {
        type: Sequelize.DATE(6),
        allowNull: false,
      },
      pr_requestor: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      storage: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      justification: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      cost_center: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      work_order: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      supplier: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      approve_status: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      approve_by: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      approved_date: {
        type: Sequelize.DATE(6),
        allowNull: false,
      },
      approved_remarks: {
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
   return queryInterface.dropTable('tbl_scm_purchase_reqs');
  }
};
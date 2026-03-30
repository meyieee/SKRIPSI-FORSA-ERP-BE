'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('tbl_mat_receipts', {
      id: {
        type: Sequelize.INTEGER(11),
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      rm_no: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      po_no: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      item_no: {
        type: Sequelize.STRING(3),
        allowNull: false,
      },
      stock_code: {
        type: Sequelize.STRING(30),
        allowNull: false,
      },
      supplier_stock_code: {
        type: Sequelize.STRING(30),
        allowNull: false,
      },
      stock_description: {
        type: Sequelize.STRING(250),
        allowNull: false,
      },
      qty_ordered: {
        type: Sequelize.STRING(9),
        allowNull: false,
      },
      qty_outstanding: {
        type: Sequelize.STRING(9),
        allowNull: false,
      },
      qty_received: {
        type: Sequelize.STRING(9),
        allowNull: false,
      },
      qty_to_received: {
        type: Sequelize.STRING(9),
        allowNull: false,
      },
      received_price: {
        type: Sequelize.STRING(10),
        allowNull: false,
      },
      supplier_code: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      supplier_description: {
        type: Sequelize.STRING(250),
        allowNull: false,
      },
      received_by: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      received_date: {
        type: Sequelize.DATE(6),
        allowNull: false,
      },
      shipping_no:{
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      company_code:{
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      storage:{
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      bin:{
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      uom:{
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      currency:{
        type: Sequelize.STRING(4),
        allowNull: false,
      },
      unit_cost:{
        type: Sequelize.STRING(10),
        allowNull: false,
      },
      account_code:{
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      work_order:{
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      received_remarks:{
        type: Sequelize.STRING(250),
        allowNull: false,
      },
      trans_type:{
        type: Sequelize.STRING(250),
        allowNull: false,
      },
      reg_by:{
        type: Sequelize.STRING(30),
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
   return queryInterface.dropTable('tbl_mat_receipts');
  }
};

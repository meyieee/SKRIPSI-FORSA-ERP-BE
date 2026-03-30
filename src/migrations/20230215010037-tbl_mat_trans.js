'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('tbl_mat_trans', {
      id: {
        type: Sequelize.INTEGER(11),
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      doc_no: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      doc_ref_no: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      trans_type: {
        type: Sequelize.STRING(30),
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
      stock_code_des: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      supplier_customer: {
        type: Sequelize.STRING(30),
        allowNull: false,
      },
      Supplier_customer_des: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      uom: {
        type: Sequelize.STRING(10),
        allowNull: false,
      },
      qty: {
        type: Sequelize.STRING(9),
        allowNull: false,
      },
      qty_in: {
        type: Sequelize.STRING(10),
        allowNull: false,
      },
      qty_out: {
        type: Sequelize.STRING(10),
        allowNull: false,
      },
      qty_bal: {
        type: Sequelize.STRING(10),
        allowNull: false,
      },
      balance: {
        type: Sequelize.STRING(10),
        allowNull: false,
      },
      currency: {
        type: Sequelize.STRING(4),
        allowNull: false,
      },
      unit_price: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      amount:{
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      company_code:{
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      ship_no:{
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      storage:{
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      bin_location:{
        type: Sequelize.STRING(20),
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
      reg_by:{
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      comments:{
        type: Sequelize.STRING(255),
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
   return queryInterface.dropTable('tbl_mat_trans');
  }
};

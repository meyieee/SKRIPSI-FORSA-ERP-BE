'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('tbl_asset_regs', {
      id: {
        type: Sequelize.INTEGER(11),
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      asset_no: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      reference_no: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      part_number: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      asset_name: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      manufacture: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      year_manufacture: {
        type: Sequelize.STRING(4),
        allowNull: false,
      },
      colour: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      model_asset_grp: {
        type: Sequelize.STRING(6),
        allowNull: false,
      },
      serial_no: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      company: {
        type: Sequelize.STRING(10),
        allowNull: false,
      },
      department: {
        type: Sequelize.STRING(10),
        allowNull: false,
      },
      cost_center: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      account_code: {
        type: Sequelize.STRING(8),
        allowNull: false,
      },
      ownership: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      user_pic: {
        type: Sequelize.STRING(25),
        allowNull: false,
      },
      barcode: {
        type: Sequelize.STRING(30),
        allowNull: false,
      },
      document: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      location: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      condition: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      room_no: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      photo: {
        type: Sequelize.STRING(255),
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
      height: {
        type: Sequelize.STRING(10),
        allowNull: false,
      },
      width: {
        type: Sequelize.STRING(10),
        allowNull: false,
      },
      depth: {
        type: Sequelize.STRING(10),
        allowNull: false,
      },
      weight: {
        type: Sequelize.STRING(10),
        allowNull: false,
      },

    //step2
      body: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      engine_type: {
        type: Sequelize.STRING(25),
        allowNull: false,
      },
      engine_size: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      seating_capacity: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      chassis: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      no_of_cylinder: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      transmission: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      tyre_amount: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      tyre_size: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      no_of_axles: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      primary_fuel_type: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      primary_tank_capacity: {
        type: Sequelize.INTEGER(20),
        allowNull: false,
      },
      secondary_fuel_type: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      secondary_fuel_capacity: {
        type: Sequelize.INTEGER(20),
        allowNull: false,
      },
      tank_units: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      processor: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      ram: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      system_type: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      operating_system: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      safety_instruction: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      short_description: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      date_operate: {
        type: Sequelize.DATE(6),
        allowNull: false,
      },
      reading: {
        type: Sequelize.INTEGER(20),
        allowNull: false,
      },
      reading_type: { //*
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      fleet_cat: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      key_no: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      radio: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      ca_pex_no: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      po_no: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      supplier: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      qty: {
        type: Sequelize.INTEGER(10),
        allowNull: false,
      },
      purchase_price: {
        type: Sequelize.INTEGER(10),
        allowNull: false,
      },
      purchase_date: {
        type: Sequelize.DATE(6),
        allowNull: false,
      },
      date_received: {
        type: Sequelize.DATE(6),
        allowNull: false,
      },
      expected_life: {
        type: Sequelize.STRING(4),
        allowNull: false,
      },
      depreciation_type: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      depreciation_year: {
        type: Sequelize.STRING(4),
        allowNull: false,
      },
      remain_value: {
        type: Sequelize.INTEGER(20),
        allowNull: false,
      },
      current_value: {
        type: Sequelize.INTEGER(20),
        allowNull: false,
      },
      add_value: {
        type: Sequelize.INTEGER(20),
        allowNull: false,
      },
      date_sold: {
        type: Sequelize.DATE(6),
        allowNull: false,
      },
      lease_no: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      insurance_no: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      warranty_no: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      rate_code: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      disposal: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
    //default
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
   return queryInterface.dropTable('tbl_asset_regs');
  }
};
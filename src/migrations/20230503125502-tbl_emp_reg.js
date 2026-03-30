'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('tbl_emp_reg', {

//personal profile
//personal
      id: {
        type: Sequelize.INTEGER(11),
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      id_number: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      first_name: {
        type: Sequelize.STRING(25),
        allowNull: false,
      },
      middle_name: {
        type: Sequelize.STRING(25),
        allowNull: false,
      },
      last_name: {
        type: Sequelize.STRING(25),
        allowNull: false,
      },
      nick_name: {
        type: Sequelize.STRING(25),
        allowNull: false,
      },
      gender: {
        type: Sequelize.STRING(10),
        allowNull: false,
      },
      date_of_birth: {
        type: Sequelize.DATE(6),
        allowNull: false,
      },
      point_of_birth: {
        type: Sequelize.STRING(25),
        allowNull: false,
      },
      marital_status: {
        type: Sequelize.STRING(10),
        allowNull: false,
      },
      religion: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      nationality: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      ethnic: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      status_date: {
        type: Sequelize.DATE(6),
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

//address
      address: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      city: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      sub_district: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      district: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      region: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      province: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      country: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      post_code: {
        type: Sequelize.STRING(10),
        allowNull: false,
      },

//medical
      blood_type: {
        type: Sequelize.STRING(2),
        allowNull: false,
      },
      height: {
        type: Sequelize.STRING(3),
        allowNull: false,
      },
      weight: {
        type: Sequelize.STRING(3),
        allowNull: false,
      },
      medication: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      allergies: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      chronic_medical_history: {
        type: Sequelize.STRING(300),
        allowNull: false,
      },

//identity
      identity_ktp: {
        type: Sequelize.STRING(25),
        allowNull: false,
      },
      home_phone: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      personal_email: {
        type: Sequelize.STRING(30),
        allowNull: false,
      },
      photo: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },

//job info
//hire
      applicant_id: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      position_no: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      approval_no: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      id_number_ref: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      hire_date: {
        type: Sequelize.DATE(6),
        allowNull: false,
      },
      service_date: {
        type: Sequelize.DATE(6),
        allowNull: false,
      },
      probation_date: {
        type: Sequelize.DATE(6),
        allowNull: false,
      },
      point_of_hire: {
        type: Sequelize.STRING(30),
        allowNull: false,
      },
      point_of_leave: {
        type: Sequelize.STRING(30),
        allowNull: false,
      },
      point_of_travel: {
        type: Sequelize.STRING(30),
        allowNull: false,
      },
      contract_no: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      contract_date: {
        type: Sequelize.DATE(6),
        allowNull: false,
      },
      contract_expire: {
        type: Sequelize.DATE(6),
        allowNull: false,
      },

//function
      job_title: {
        type: Sequelize.STRING(40),
        allowNull: false,
      },
      position_title: {
        type: Sequelize.STRING(40),
        allowNull: false,
      },
      work_function: {
        type: Sequelize.STRING(30),
        allowNull: false,
      },
      job_level: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      individual_grade: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      individual_level: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      employee_type: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      employee_class: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      employment_type: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      supervisor: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },

//organization
      branch_code: {
        type: Sequelize.STRING(6),
        allowNull: false,
      },
      emp_company: {
        type: Sequelize.STRING(6),
        allowNull: false,
      },
      dept_code: {
        type: Sequelize.STRING(6),
        allowNull: false,
      },
      cost_center: {
        type: Sequelize.STRING(12),
        allowNull: false,
      },
      account_code: {
        type: Sequelize.STRING(12),
        allowNull: false,
      },
      union_code: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },

//location
      onsite_location: {
        type: Sequelize.STRING(30),
        allowNull: false,
      },
      onsite_address: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      work_location: {
        type: Sequelize.STRING(30),
        allowNull: false,
      },
      office_code: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      onsite_marital: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      marital_benefit: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },

//contact
      work_phone: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      mobile: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      wa: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      email_company: {
        type: Sequelize.STRING(30),
        allowNull: false,
      },
      website: {
        type: Sequelize.STRING(30),
        allowNull: false,
      },
  
  //termination
      termination_date: {
        type: Sequelize.DATE(6),
        allowNull: false,
      },
      termination_by: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      termination_reason: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },

//compensation
  //benefit
      playgroup: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      bank_account: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      leave_type: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },

  //insurance
    work_insurance: {
      type: Sequelize.STRING(15),
      allowNull: false,
    },
    medical_insurance: {
      type: Sequelize.STRING(15),
      allowNull: false,
    },
    tax_code: {
      type: Sequelize.STRING(15),
      allowNull: false,
    },
  
    //performance
      work_day: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      crew: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      last_promotion: {
        type: Sequelize.DATE(6),
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
   return queryInterface.dropTable('tbl_emp_reg');
  }
};
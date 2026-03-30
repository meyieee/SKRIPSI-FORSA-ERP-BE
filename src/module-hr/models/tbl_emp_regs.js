const { Model, DataTypes } = require("sequelize");

class tbl_emp_regs extends Model {
  static init(sequelize) {
    super.init(
      {
        id_number: DataTypes.STRING,
        first_name: DataTypes.STRING,
        middle_name: DataTypes.STRING,
        last_name: DataTypes.STRING,
        nick_name: DataTypes.STRING,
        gender: DataTypes.STRING,
        date_of_birth: DataTypes.DATE,
        point_of_birth: DataTypes.STRING,
        marital_status: DataTypes.STRING,
        religion: DataTypes.STRING,
        nationality: DataTypes.STRING,
        ethnic: DataTypes.STRING,
        status: DataTypes.STRING,
        status_date: DataTypes.DATE,
        reg_by: DataTypes.STRING, //*
        reg_date: DataTypes.DATE,
        address: DataTypes.STRING,
        city: DataTypes.STRING,
        sub_district: DataTypes.STRING,
        district: DataTypes.STRING,
        region: DataTypes.STRING,
        province: DataTypes.STRING,
        country: DataTypes.STRING,
        post_code: DataTypes.STRING,
        blood_type: DataTypes.STRING,
        height: DataTypes.STRING,
        weight: DataTypes.STRING,
        medication: DataTypes.STRING,
        allergies: DataTypes.STRING,
        chronic_medical_history: DataTypes.STRING,
        identity_ktp: DataTypes.STRING,
        home_phone: DataTypes.STRING,
        personal_email: DataTypes.STRING,
        photo: DataTypes.STRING,
        applicant_id: DataTypes.STRING,
        position_no: DataTypes.STRING,
        approval_no: DataTypes.STRING,
        id_number_ref: DataTypes.STRING,
        hire_date: DataTypes.DATE,
        service_date: DataTypes.DATE,
        probation_date: DataTypes.DATE,
        point_of_hire: DataTypes.STRING,
        point_of_leave: DataTypes.STRING,
        point_of_travel: DataTypes.STRING,
        contract_no: DataTypes.STRING,
        contract_date: DataTypes.DATE,
        contract_expire: DataTypes.DATE,
        job_title: DataTypes.STRING, //*
        position_title: DataTypes.STRING,
        work_function: DataTypes.STRING,
        job_level: DataTypes.STRING,
        individual_grade: DataTypes.STRING,
        individual_level: DataTypes.STRING,
        employee_type: DataTypes.STRING, //*
        employee_class: DataTypes.STRING, //*
        employment_type: DataTypes.STRING, //*
        supervisor: DataTypes.STRING,
        branch_code: DataTypes.STRING, //*
        emp_company: DataTypes.STRING, //*
        dept_code: DataTypes.STRING, //*
        section_code: DataTypes.STRING,
        cost_center: DataTypes.STRING, //*
        account_code: DataTypes.STRING, //*
        union_code: DataTypes.STRING,
        onsite_location: DataTypes.STRING,
        onsite_address: DataTypes.STRING,
        work_location: DataTypes.STRING,
        office_code: DataTypes.STRING, //*
        onsite_marital: DataTypes.STRING,
        marital_benefit: DataTypes.STRING,
        work_phone: DataTypes.STRING,
        mobile: DataTypes.STRING,
        wa: DataTypes.STRING,
        email_company: DataTypes.STRING,
        website: DataTypes.STRING,
        termination_date: DataTypes.DATE,
        termination_by: DataTypes.STRING,
        termination_reason: DataTypes.STRING,
        paygroup: DataTypes.STRING,
        bank_account: DataTypes.STRING,
        leave_type: DataTypes.STRING,
        work_insurance: DataTypes.STRING,
        medical_insurance: DataTypes.STRING,
        tax_code: DataTypes.STRING,
        work_day: DataTypes.STRING,
        crew: DataTypes.STRING,
        last_promotion: DataTypes.DATE,
        remarks: DataTypes.STRING,
      },
      {
        sequelize,
      }
    );
  }
  static associate(models) {
    /*
            note:

                belongsTo:        
                    foreignKey: dari table ini
                    targetKey: dari table relasinya

                hasOne
                sourceKey: dari table ini
                foreignKey: dari table relasinya
            */
    tbl_emp_regs.belongsTo(models.tbl_emp_regs, {
      foreignKey: "reg_by",
      targetKey: "id_number",
      as: "reg_by_detail",
    });
    tbl_emp_regs.belongsTo(models.emp_cf_01_types, {
      foreignKey: "employee_type",
      targetKey: "emp_type",
      as: "employee_type_detail",
    });
    tbl_emp_regs.belongsTo(models.emp_cf_02_classes, {
      foreignKey: "employee_class",
      targetKey: "emp_class",
      as: "emplyoee_class_detail",
    });
    tbl_emp_regs.belongsTo(models.emp_cf_03_employtypes, {
      foreignKey: "employment_type",
      targetKey: "employ_type",
      as: "employment_type_detail",
    });
    tbl_emp_regs.belongsTo(models.adm_cf_00_coms, {
      foreignKey: "branch_code",
      targetKey: "com_code",
      as: "branch_detail",
    });
    tbl_emp_regs.belongsTo(models.adm_cf_00_coms, {
      foreignKey: "emp_company",
      targetKey: "com_code",
      as: "com_detail",
    });
    tbl_emp_regs.belongsTo(models.adm_cf_11_dept, {
      foreignKey: "dept_code",
      targetKey: "dept_code",
      as: "department_detail",
    });
    tbl_emp_regs.belongsTo(models.adm_cf_13_costcenter, {
      foreignKey: "cost_center",
      targetKey: "c_code",
      as: "cost_center_detail",
    });
    tbl_emp_regs.belongsTo(models.adm_cf_14_account, {
      foreignKey: "account_code",
      targetKey: "account_no",
      as: "account_detail",
    });
    tbl_emp_regs.belongsTo(models.emp_cf_plan_posttitle, {
      foreignKey: "job_title",
      targetKey: "title",
      as: "job_title_detail",
    });
    tbl_emp_regs.belongsTo(models.adm_cf_18_locwork, {
      foreignKey: "work_location",
      targetKey: "locwork_code",
      as: "locwork_detail",
    });
  }
}

module.exports = tbl_emp_regs;

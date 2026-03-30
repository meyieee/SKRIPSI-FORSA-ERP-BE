const EmployeeRegister = require("../models/tbl_emp_regs");
const { Op } = require('sequelize')
const { getModelEmployeeRegister, getModelEmployeeClass, getModelEmployeeType, getModelDepartment, getModelAccount, getModelCostCenter, getModelCom, getModelEmploymentType, getModelPostTitle, getModelLockWork } = require('../../function/getIncludeModels')
const { getAttributeEmployeeFullName } = require('../../function/getIncludeAtributes');

module.exports = {
 getAllEmployeeGroupedByDeptRepository : async () => {
    const employees = await EmployeeRegister.findAll({
      order: [['id', 'DESC']],
      raw: true,
      include:[
        getModelEmployeeRegister('reg_by_detail'),
        getModelEmployeeClass('emplyoee_class_detail'),
        getModelEmployeeType('employee_type_detail'),
        getModelDepartment('department_detail'),
        getModelAccount('account_detail'),
        getModelCostCenter('cost_center_detail'),
        getModelCom('com_detail'),
        getModelCom('branch_detail'),
        getModelEmploymentType('employment_type_detail'),
        getModelPostTitle('job_title_detail'),
        getModelLockWork('locwork_detail')
      ],
      attributes: {
        include:[
          [getAttributeEmployeeFullName('reg_by_detail'), 'reg_by_name'],
        ]
      }
    });
  
    return employees.reduce((acc, emp) => {
      if (!acc[emp.dept_code]) acc[emp.dept_code] = [];
      acc[emp.dept_code].push(emp);
      return acc;
    }, {});
  },

  getAllEmployeeByBranchGroupedByDeptRepository : async (branch_code) => {
    const employees = await EmployeeRegister.findAll({
      order: [['id', 'DESC']],
      raw: true,
      where:{branch_code},
      include:[
        getModelEmployeeRegister('reg_by_detail'),
        getModelEmployeeClass('emplyoee_class_detail'),
        getModelEmployeeType('employee_type_detail'),
        getModelDepartment('department_detail'),
        getModelAccount('account_detail'),
        getModelCostCenter('cost_center_detail'),
        getModelCom('com_detail'),
        getModelCom('branch_detail'),
        getModelEmploymentType('employment_type_detail'),
        getModelPostTitle('job_title_detail'),
        getModelLockWork('locwork_detail')
      ],
      attributes: {
        include:[
          [getAttributeEmployeeFullName('reg_by_detail'), 'reg_by_name'],
        ]
      }
    });
  
    return employees.reduce((acc, emp) => {
      if (!acc[emp.dept_code]) acc[emp.dept_code] = [];
      acc[emp.dept_code].push(emp);
      return acc;
    }, {});
  },

  getEmployeeRegisterByIdNumberRepository: async (id_number) =>{
   return await EmployeeRegister.findOne({
      raw: true,
      where: {id_number},
      attributes:['id', 'id_number']
    })
  },

  getEmployeeRegisterByIdNumberExcludeCurrentIdRepository: async (id_number, id)=>{
    return await EmployeeRegister.findOne({
        where: { id_number, [Op.not]: {id}},
        attributes:['id', 'id_number']
    })
  },

  getExistingEmployeeByIdRepository: async (id) =>{
    return await EmployeeRegister.findOne({
        where: {id},
        attributes:['id', 'id_number', 'photo','branch_code']
    })
  },

  getEmployeeRegisterByIdRepository: async (id) =>{
    return await EmployeeRegister.findOne({
      where: {id},
      raw: true,
      include:[
        getModelEmployeeRegister('reg_by_detail'),
        getModelEmployeeClass('emplyoee_class_detail'),
        getModelEmployeeType('employee_type_detail'),
        getModelDepartment('department_detail'),
        getModelAccount('account_detail'),
        getModelCostCenter('cost_center_detail'),
        getModelCom('com_detail'),
        getModelCom('branch_detail'),
        getModelEmploymentType('employment_type_detail'),
        getModelPostTitle('job_title_detail'),
        getModelLockWork('locwork_detail')
      ],
      attributes: {
        include:[
          [getAttributeEmployeeFullName('reg_by_detail'), 'reg_by_name'],
        ]
      }
    })
  },

  getAllEmployeeRepository: async (branch_code) => {

    const whereClause = branch_code ? {
      status: 'Active',
      branch_code 
    } : {
         status: 'Active',
    };

    return await EmployeeRegister.findAll({
        order: [
          ['id', 'DESC'],
        ],
        raw: true,
        where: whereClause,
        include:[
          getModelCom('branch_detail', ['com_code', 'com_name']),
          getModelDepartment('department_detail', ['dept_des', 'dept_code']),
        ]
        // attributes:['id', 'id_number', 'photo', 'first_name', 'middle_name', 'last_name', 'status', 'branch_code', 'branch_code', '']
      })
  },

  postEmployeeRegisterRepository: async (params, reqFile) => {
    const{
         // Step 1
         id_number, first_name, middle_name, last_name, nick_name, gender, date_of_birth, 
         point_of_birth, marital_status, religion, nationality, ethnic, status, status_date, 
         reg_by, reg_date, address, city, sub_district, district, region, province, country, 
         post_code, blood_type, height, weight, medication, allergies, chronic_medical_history, 
         identity_ktp, home_phone, personal_email, 

         // Step 2
         applicant_id, position_no, approval_no, 
         id_number_ref, hire_date, service_date, probation_date, point_of_hire, point_of_leave, 
         point_of_travel, contract_no, contract_date, contract_expire, job_title, position_title, 
         work_function, job_level, individual_grade, individual_level, employee_type, employee_class, 
         employment_type, supervisor, branch_code, emp_company, dept_code, cost_center, account_code, 
         union_code, onsite_location, onsite_address, work_location, office_code, onsite_marital, 
         marital_benefit, work_phone, mobile, wa, email_company, website, termination_date, termination_by,
         termination_reason, 
         
         // Step 3
         paygroup, bank_account, leave_type, work_insurance, medical_insurance, 
         tax_code, work_day, crew, last_promotion,
    } = params;

    await EmployeeRegister.create({
        // Step 1
        id_number, first_name, middle_name, last_name, nick_name, gender, date_of_birth, 
        point_of_birth, marital_status, religion, nationality, ethnic, status, status_date, 
        reg_by, reg_date, address, city, sub_district, district, region, province, country, 
        post_code, blood_type, height, weight, medication, allergies, chronic_medical_history, 
        identity_ktp, home_phone, personal_email, photo: reqFile ? `images/${reqFile.filename}` : null,

        // Step 2
        applicant_id, position_no, approval_no, 
        id_number_ref, hire_date, service_date, probation_date, point_of_hire, point_of_leave, 
        point_of_travel, contract_no, contract_date, contract_expire, job_title, position_title, 
        work_function, job_level, individual_grade, individual_level, employee_type, employee_class, 
        employment_type, supervisor, branch_code, emp_company, dept_code, cost_center, account_code, 
        union_code, onsite_location, onsite_address, work_location, office_code, onsite_marital, 
        marital_benefit, work_phone, mobile, wa, email_company, website, termination_date, termination_by,
        termination_reason, 
        
        // Step 3
        paygroup, bank_account, leave_type, work_insurance, medical_insurance, 
        tax_code, work_day, crew, last_promotion,
      })

  },

  updateEmployeeRegisterRepository: async (params, reqFile, id, employeePhoto) => {
    
    const {
         // Step 1
         id_number, first_name, middle_name, last_name, nick_name, gender, date_of_birth, 
         point_of_birth, marital_status, religion, nationality, ethnic, status, status_date, 
         reg_by, reg_date, address, city, sub_district, district, region, province, country, 
         post_code, blood_type, height, weight, medication, allergies, chronic_medical_history, 
         identity_ktp, home_phone, personal_email, image,
      
 
         // Step 2
         applicant_id, position_no, approval_no, 
         id_number_ref, hire_date, service_date, probation_date, point_of_hire, point_of_leave, 
         point_of_travel, contract_no, contract_date, contract_expire, job_title, position_title, 
         work_function, job_level, individual_grade, individual_level, employee_type, employee_class, 
         employment_type, supervisor, branch_code, emp_company, dept_code, cost_center, account_code, 
         union_code, onsite_location, onsite_address, work_location, office_code, onsite_marital, 
         marital_benefit, work_phone, mobile, wa, email_company, website, termination_date, termination_by,
         termination_reason, 
         
         // Step 3
         paygroup, bank_account, leave_type, work_insurance, medical_insurance, 
         tax_code, work_day, crew, last_promotion,
    } = params;


    await EmployeeRegister.update(
        {
            // Step 1
            id_number, first_name, middle_name, last_name, nick_name, gender, date_of_birth, 
            point_of_birth, marital_status, religion, nationality, ethnic, status, status_date, 
            reg_by, reg_date, address, city, sub_district, district, region, province, country, 
            post_code, blood_type, height, weight, medication, allergies, chronic_medical_history, 
            identity_ktp, home_phone, personal_email, 
            photo: reqFile ? `images/${reqFile.filename}` :
                    image === 'deleted' ? null :
                    employeePhoto,

            // Step 2
            applicant_id, position_no, approval_no, 
            id_number_ref, hire_date, service_date, probation_date, point_of_hire, point_of_leave, 
            point_of_travel, contract_no, contract_date, contract_expire, job_title, position_title, 
            work_function, job_level, individual_grade, individual_level, employee_type, employee_class, 
            employment_type, supervisor, branch_code, emp_company, dept_code, cost_center, account_code, 
            union_code, onsite_location, onsite_address, work_location, office_code, onsite_marital, 
            marital_benefit, work_phone, mobile, wa, email_company, website, termination_date, termination_by,
            termination_reason, 
            
            // Step 3
            paygroup, bank_account, leave_type, work_insurance, medical_insurance, 
            tax_code, work_day, crew, last_promotion,
        },
        { where: { id }})
  },

  updateStatusEmployeeRegisterRepository: async (id, status, remarks) => {
    await EmployeeRegister.update({status, remarks},{where: {id}});
  },

  postEmployeeByFirstRegisterUserRepository: async (payload, transaction) => {
    const { first_name, last_name, id_number, branch_code } = payload;
    await EmployeeRegister.create({first_name, last_name, id_number, reg_by:id_number, branch_code, status: 'Active', status_date: new Date()},{ transaction });
  },
}
'use strict';

const OPTIONAL_COLUMNS = {
  first_name: { type: 'STRING', length: 25 },
  middle_name: { type: 'STRING', length: 25 },
  last_name: { type: 'STRING', length: 25 },
  nick_name: { type: 'STRING', length: 25 },
  gender: { type: 'STRING', length: 10 },
  date_of_birth: { type: 'DATE' },
  point_of_birth: { type: 'STRING', length: 25 },
  marital_status: { type: 'STRING', length: 10 },
  religion: { type: 'STRING', length: 15 },
  nationality: { type: 'STRING', length: 15 },
  ethnic: { type: 'STRING', length: 15 },
  address: { type: 'STRING', length: 255 },
  city: { type: 'STRING', length: 15 },
  sub_district: { type: 'STRING', length: 20 },
  district: { type: 'STRING', length: 20 },
  region: { type: 'STRING', length: 20 },
  province: { type: 'STRING', length: 20 },
  country: { type: 'STRING', length: 20 },
  post_code: { type: 'STRING', length: 10 },
  blood_type: { type: 'STRING', length: 2 },
  height: { type: 'STRING', length: 3 },
  weight: { type: 'STRING', length: 3 },
  medication: { type: 'STRING', length: 255 },
  allergies: { type: 'STRING', length: 255 },
  chronic_medical_history: { type: 'STRING', length: 300 },
  identity_ktp: { type: 'STRING', length: 25 },
  home_phone: { type: 'STRING', length: 20 },
  personal_email: { type: 'STRING', length: 30 },
  applicant_id: { type: 'STRING', length: 15 },
  position_no: { type: 'STRING', length: 15 },
  approval_no: { type: 'STRING', length: 15 },
  id_number_ref: { type: 'STRING', length: 15 },
  hire_date: { type: 'DATE' },
  service_date: { type: 'DATE' },
  probation_date: { type: 'DATE' },
  point_of_hire: { type: 'STRING', length: 30 },
  point_of_leave: { type: 'STRING', length: 30 },
  point_of_travel: { type: 'STRING', length: 30 },
  contract_no: { type: 'STRING', length: 20 },
  contract_date: { type: 'DATE' },
  contract_expire: { type: 'DATE' },
  job_title: { type: 'STRING', length: 40 },
  position_title: { type: 'STRING', length: 40 },
  work_function: { type: 'STRING', length: 30 },
  job_level: { type: 'STRING', length: 20 },
  individual_grade: { type: 'STRING', length: 20 },
  individual_level: { type: 'STRING', length: 20 },
  employee_type: { type: 'STRING', length: 20 },
  employee_class: { type: 'STRING', length: 20 },
  employment_type: { type: 'STRING', length: 20 },
  supervisor: { type: 'STRING', length: 20 },
  account_code: { type: 'STRING', length: 12 },
  union_code: { type: 'STRING', length: 15 },
  onsite_location: { type: 'STRING', length: 30 },
  onsite_address: { type: 'STRING', length: 255 },
  work_location: { type: 'STRING', length: 30 },
  office_code: { type: 'STRING', length: 15 },
  onsite_marital: { type: 'STRING', length: 15 },
  marital_benefit: { type: 'STRING', length: 15 },
  work_phone: { type: 'STRING', length: 15 },
  mobile: { type: 'STRING', length: 15 },
  wa: { type: 'STRING', length: 15 },
  email_company: { type: 'STRING', length: 30 },
  website: { type: 'STRING', length: 30 },
  termination_date: { type: 'DATE' },
  termination_by: { type: 'STRING', length: 15 },
  termination_reason: { type: 'STRING', length: 255 },
  paygroup: { type: 'STRING', length: 15 },
  bank_account: { type: 'STRING', length: 15 },
  leave_type: { type: 'STRING', length: 15 },
  work_insurance: { type: 'STRING', length: 15 },
  medical_insurance: { type: 'STRING', length: 15 },
  tax_code: { type: 'STRING', length: 15 },
  work_day: { type: 'STRING', length: 15 },
  crew: { type: 'STRING', length: 15 },
  last_promotion: { type: 'DATE' },
  remarks: { type: 'STRING', length: 255 },
  kin_fullname: { type: 'STRING', length: 255 },
  kin_relationship: { type: 'STRING', length: 100 },
  kin_address: { type: 'STRING', length: 255 },
  kin_phone: { type: 'STRING', length: 50 },
  kin_wa: { type: 'STRING', length: 50 },
  kin_email: { type: 'STRING', length: 100 },
};

const resolveType = (Sequelize, config) => {
  if (config.type === 'DATE') return Sequelize.DATE;
  return config.length ? Sequelize.STRING(config.length) : Sequelize.STRING;
};

const resolveExistingTable = async (queryInterface) => {
  const candidates = ['tbl_emp_regs', 'tbl_emp_reg'];
  for (const name of candidates) {
    try {
      await queryInterface.describeTable(name);
      return name;
    } catch (error) {
      continue;
    }
  }
  throw new Error('Employee register table not found');
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableName = await resolveExistingTable(queryInterface);
    const tableDefinition = await queryInterface.describeTable(tableName);

    for (const [column, config] of Object.entries(OPTIONAL_COLUMNS)) {
      if (!tableDefinition[column]) continue;
      await queryInterface.changeColumn(tableName, column, {
        type: resolveType(Sequelize, config),
        allowNull: true,
      });
    }
  },

  down: async () => {
    return Promise.resolve();
  },
};

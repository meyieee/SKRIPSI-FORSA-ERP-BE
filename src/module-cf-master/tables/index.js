//Auth
const User = require("../models/User.js");
const token_blacklists = require("../models/token_blacklists");

const adm_cf_00_coms = require("../models/adm_cf_00_coms");
const adm_cf_00_com_dets = require("../models/adm_cf_00_com_dets");
const adm_cf_01_contacts = require("../models/adm_cf_01_contacts");
const adm_cf_02_documents = require("../models/adm_cf_02_documents");
const adm_cf_03_contracts = require("../models/adm_cf_03_contracts");
const adm_cf_03_contracts_files = require("../models/adm_cf_03_contracts_files");
const adm_cf_04_pictures = require("../models/adm_cf_04_pictures");

const adm_cf_10_divisions = require("../models/adm_cf_10_division");
const adm_cf_11_dept = require("../models/adm_cf_11_dept");
const adm_cf_11_depts_section = require("../models/adm_cf_11_depts_section");
const adm_cf_12_bu = require("../models/adm_cf_12_bu");
const adm_cf_13_costcenter = require("../models/adm_cf_13_costcenter");
const adm_cf_14_account = require("../models/adm_cf_14_account");
const adm_cf_15_currency = require("../models/adm_cf_15_currency");
const adm_cf_16_locops = require("../models/adm_cf_16_locops");
const adm_cf_17_location = require("../models/adm_cf_17_location");
const adm_cf_18_locwork = require("../models/adm_cf_18_locwork");
const adm_cf_19_priority = require("../models/adm_cf_19_priority");
const adm_cf_20_colour = require("../models/adm_cf_20_colour");
const adm_cf_21_officers = require("../models/adm_cf_21_officers");
const adm_cf_21_officertypes = require("../models/adm_cf_21_officertypes");

// RBAC Models
const adm_fia_control_user_role = require("../models/adm_fia_control_user_role");
const adm_fia_control_user_privilege = require("../models/adm_fia_control_user_privilege");
const adm_fia_control_feature = require("../models/adm_fia_control_feature");
const adm_fia_control_role_privilege = require("../models/adm_fia_control_role_privilege");

const CFMasterInit = (connection) => {
  User.init(connection);
  token_blacklists.init(connection);
  adm_cf_00_coms.init(connection);
  adm_cf_00_com_dets.init(connection);
  adm_cf_01_contacts.init(connection);
  adm_cf_02_documents.init(connection);
  adm_cf_03_contracts.init(connection);
  adm_cf_04_pictures.init(connection);
  adm_cf_03_contracts_files.init(connection);
  adm_cf_10_divisions.init(connection);
  adm_cf_11_dept.init(connection);
  adm_cf_11_depts_section.init(connection);
  adm_cf_12_bu.init(connection);
  adm_cf_13_costcenter.init(connection);
  adm_cf_14_account.init(connection);
  adm_cf_15_currency.init(connection);
  adm_cf_16_locops.init(connection);
  adm_cf_17_location.init(connection);
  adm_cf_18_locwork.init(connection);
  adm_cf_19_priority.init(connection);
  adm_cf_20_colour.init(connection);
  adm_cf_21_officers.init(connection);
  adm_cf_21_officertypes.init(connection);

  // RBAC Models Init
  adm_fia_control_user_role.init(connection);
  adm_fia_control_user_privilege.init(connection);
  adm_fia_control_feature.init(connection);
  adm_fia_control_role_privilege.init(connection);
};

const CFMasterAssociate = (models) => {
  User.associate(models);
  token_blacklists.associate(models);
  adm_cf_00_coms.associate(models);
  adm_cf_00_com_dets.associate(models);
  adm_cf_01_contacts.associate(models);
  adm_cf_03_contracts_files.associate(models);
  adm_cf_10_divisions.associate(models);
  adm_cf_11_dept.associate(models);
  adm_cf_11_depts_section.associate(models);
  adm_cf_12_bu.associate(models);
  adm_cf_13_costcenter.associate(models);
  adm_cf_14_account.associate(models);
  adm_cf_15_currency.associate(models);
  adm_cf_16_locops.associate(models);
  adm_cf_17_location.associate(models);
  adm_cf_18_locwork.associate(models);
  adm_cf_19_priority.associate(models);
  adm_cf_20_colour.associate(models);
  adm_cf_21_officers.associate(models);
  adm_cf_21_officertypes.associate(models);

  // RBAC Models Associate
  adm_fia_control_user_role.associate(models);
  adm_fia_control_user_privilege.associate(models);
  adm_fia_control_feature.associate(models);
  adm_fia_control_role_privilege.associate(models);
};

module.exports = { CFMasterInit, CFMasterAssociate };

// src/module-fia-resource/tables.js

const fia_res_online_feeds_tasks_messages = require("../models/fia_res_online_feeds_tasks_messages");
const fia_res_online_feeds_roster = require("../models/fia_res_online_feeds_roster");
const fia_res_online_feeds_tasks = require("../models/fia_res_online_feeds_tasks");

const adm_fia_online_approval_no = require("../models/adm_fia_online_approval_no");
const adm_fia_online_req_approver_process = require("../models/adm_fia_online_req_approver_process");
const adm_fia_online_req_approver_type = require("../models/adm_fia_online_req_approver_type");
const adm_fia_online_req_approver_master = require("../models/adm_fia_online_req_approver_master");

const FIAResourceInit = (connection) => {
  // daftar SEMUA model dalam module-fia-resource
  fia_res_online_feeds_tasks_messages.init(connection);
  fia_res_online_feeds_roster.init(connection);
  fia_res_online_feeds_tasks.init(connection);
  adm_fia_online_approval_no.init(connection);
  adm_fia_online_req_approver_process.init(connection);
  adm_fia_online_req_approver_type.init(connection);
  adm_fia_online_req_approver_master.init(connection);
};

const FIAResourceAssociate = (models) => {
  // panggil associate untuk masing-masing model
  fia_res_online_feeds_tasks_messages.associate(models);
  fia_res_online_feeds_roster.associate(models);
  fia_res_online_feeds_tasks.associate(models);
  adm_fia_online_approval_no.associate(models);
  adm_fia_online_req_approver_process.associate(models);
  adm_fia_online_req_approver_type.associate(models);
  adm_fia_online_req_approver_master.associate(models);
};

module.exports = { FIAResourceInit, FIAResourceAssociate };

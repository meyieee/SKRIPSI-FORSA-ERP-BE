const Sequelize = require("sequelize");
const dotenv = require("dotenv").config();
const env = process.env.NODE_ENV || "development";
const dbConfig = require("../config/config.js")[env];
const connection = new Sequelize({ ...dbConfig, dialect: "mysql" });

const { CFMasterInit, CFMasterAssociate } = require('../module-cf-master/tables')
const { CFHRInit, CFHRAssociate } = require('../module-cf-hr/tables');
const { HRInit, HRAssociate } = require('../module-hr/tables');
const { FIAHomeInit, FIAHomeAssociate } = require('../module-fia-home/tables');
const { FIAResourceInit, FIAResourceAssociate } = require('../module-fia-resource/tables');

CFHRInit(connection)
CFMasterInit(connection)
HRInit(connection)
FIAHomeInit(connection)
FIAResourceInit(connection);

CFHRAssociate(connection.models)
CFMasterAssociate(connection.models)
HRAssociate(connection.models)
FIAHomeAssociate(connection.models)
FIAResourceAssociate(connection.models);

module.exports = connection;

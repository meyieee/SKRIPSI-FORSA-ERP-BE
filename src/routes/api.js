const express = require("express");
const router = express.Router();

const HRRouters = require("../module-hr/routers");
const CFMasterRouters = require("../module-cf-master/routers");
const CFHRRouters = require("../module-cf-hr/routers");
const FIAHomeRouters = require("../module-fia-home/routers");
const FIAResourceRouters = require("../module-fia-resource/routers");

HRRouters(router);
CFMasterRouters(router);
CFHRRouters(router);
FIAHomeRouters(router);
FIAResourceRouters(router);

module.exports = router;

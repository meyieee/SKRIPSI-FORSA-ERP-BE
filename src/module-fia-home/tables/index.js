const adm_fia_online_req = require('../models/adm_fia_online_req.js')
const adm_fia_online_req_accomodation = require('../models/adm_fia_online_req_accomodation.js')
const adm_fia_online_req_inspect = require('../models/adm_fia_online_req_inspect.js')
const adm_fia_online_req_itempurchasereq = require('../models/adm_fia_online_req_itempurchasereq.js')
const adm_fia_online_req_itinerary = require('../models/adm_fia_online_req_itinerary.js')
const adm_fia_online_req_traveller = require('../models/adm_fia_online_req_traveller.js')

const FIAHomeInit = (connection) => {
    adm_fia_online_req.init(connection)
    adm_fia_online_req_accomodation.init(connection)
    adm_fia_online_req_inspect.init(connection)
    adm_fia_online_req_itempurchasereq.init(connection)
    adm_fia_online_req_itinerary.init(connection)
    adm_fia_online_req_traveller.init(connection)
}

const FIAHomeAssociate = (models) => {
    adm_fia_online_req.associate(models)
    adm_fia_online_req_accomodation.associate(models)
    adm_fia_online_req_inspect.associate(models)
    adm_fia_online_req_itempurchasereq.associate(models)
    adm_fia_online_req_itinerary.associate(models)
    adm_fia_online_req_traveller.associate(models)
}

module.exports = { FIAHomeInit, FIAHomeAssociate }


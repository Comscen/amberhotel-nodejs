var express = require('express')
var router = express.Router()

var listingController = require('../controllers/listing')

router.get("/", listingController.showHotels)

module.exports = router
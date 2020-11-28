var express = require('express')
var router = express.Router()

var listingController = require('../controllers/listing')

router.get("/", listingController.showHotels)

router.get("/rooms", listingController.showRooms)

module.exports = router
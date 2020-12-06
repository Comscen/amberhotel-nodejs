var express = require('express')
var router = express.Router()

var listingController = require('../controllers/listing')

router.get("/", listingController.showHotels)

router.get("/rooms", listingController.showRooms)

router.get("/rooms/:id", listingController.showSingleRoom)

router.get("/rooms/:id/book", listingController.showReservationForm)

router.post("/rooms/:id/book", listingController.handleReservationForm)

module.exports = router
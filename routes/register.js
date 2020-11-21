var express = require('express')
var router = express.Router()

var registerController = require('../controllers/register')

router.get("/", registerController.showRegisterForm)

router.post("/", registerController.handleRegisterForm)

router.get("/hotel", registerController.showHotelRegisterForm)

router.post("/hotel", registerController.handleHotelRegisterForm)

module.exports = router
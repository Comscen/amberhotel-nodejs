var express = require('express')
var router = express.Router()

var registerController = require('../controllers/register')

router.get("/", registerController.showRegisterForm)

router.post("/", registerController.handleRegisterForm)

module.exports = router
var express = require('express')
var router = express.Router()

var loginController = require('../controllers/login')

router.get("/", loginController.showLoginForm)

router.post("/", loginController.handleLoginForm)

module.exports = router
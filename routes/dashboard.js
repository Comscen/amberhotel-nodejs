var express = require('express')
var router = express.Router()

var dashboardController = require('../controllers/dashboard')

router.get('/', dashboardController.showDashboard)


module.exports = router
var express = require('express')
var router = express.Router()

var dashboardController = require('../controllers/dashboard')

router.get('/', dashboardController.showDashboard)

router.get('/add', dashboardController.showAddRoomForm)

router.post('/add', dashboardController.handleAddRoomForm)

router.get('/edit/:id', dashboardController.showEditRoomForm)

router.post('/edit/:id', dashboardController.handleEditRoomForm)


module.exports = router
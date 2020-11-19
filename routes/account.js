var express = require('express')
var router = express.Router()

var accountController = require('../controllers/account')

router.get("/", accountController.showOwnAccount)

router.get("/:id", accountController.showSpecificAccount)

router.get("/:id/edit", accountController.showEditForm)

router.post("/:id/edit", accountController.handleEditForm)

router.get('/:id/edit/password', accountController.showEditPasswordForm)

router.post('/:id/edit/password', accountController.handleEditPasswordForm)

module.exports = router
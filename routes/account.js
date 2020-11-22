var express = require('express')
var router = express.Router()

var accountController = require('../controllers/account')

router.get("/", accountController.showAccount)

router.get("/:id", accountController.showAccount)

router.get("/:id/edit", accountController.showEditForm)

router.post("/:id/edit", accountController.chooseHandlerForEditForm)

router.get('/:id/edit/password', accountController.showEditPasswordForm)

router.post('/:id/edit/password', accountController.handleEditPasswordForm)

module.exports = router
var express = require('express')
var router = express.Router()

var commentsController = require('../controllers/comments')

//Show form to add comment about hotel
router.get('/add/hotel/:id', commentsController.showForUserCommentForm)

//Show form to add comment about private user
router.get('add/user/:id', commentsController.showForHotelCommentForm)

//Handle form to add comment about hotel
router.post('/add/hotel/:id', commentsController.handleForUserCommentForm)

//Handle form to add comment about private user
router.post('add/user/:id', commentsController.handleForHotelCommentForm)

module.exports = router
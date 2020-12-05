var mongoose = require('mongoose')
var { nanoid } = require('nanoid')

const CommentSchema = new mongoose.Schema({
    _id: { type: String, default: () => nanoid(10) },
    title: { type: String, required: true },
    content: { type: String, required: true },
    rating: { type: Number, max: 5, min: 0, required: true },
    byUser: Boolean,
    user: { type: String, ref: 'User', required: true },
    hotel: { type: String, ref: 'Hotel', required: true }
})

const Comment = mongoose.model('Comment', CommentSchema)

module.exports = Comment
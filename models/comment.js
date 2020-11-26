var mongoose = require('mongoose')
var { nanoid } = require('nanoid')

const CommentSchema = new mongoose.Schema({
    _id: { type: String, default: () => nanoid(10) },
    title: {type:String, required: true },
    content: {type:String, required: true },
    rating: {type: Number, max: 5, min:1, required: true },
    byUser: Boolean,
    _userId: { type: String, ref: 'User', required: true },
    _hotelId: { type: String, ref: 'Hotel', required: true }
})

const Comment = mongoose.Model('Comment', CommentSchema)

module.exports = Comment
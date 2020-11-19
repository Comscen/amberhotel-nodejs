var mongoose = require('mongoose')

const CommentSchema = new mongoose.Schema({
    _id: { type: String, default: () => nanoid(10) },
    title: String,
    content: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel' },
    byHotel: Boolean,
    byUser: Boolean
})

const Comment = mongoose.Model('Comment', CommentSchema)

module.exports = Comment
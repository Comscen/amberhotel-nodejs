var mongoose = require('mongoose')
var { nanoid } = require('nanoid')

const RoomSchema = new mongoose.Schema({
    _id: { type: String, default: () => nanoid(10), unique: true },
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    beds: { type: Number, required: true },
    capacity: { type: Number, required: true },
    standard: { type: String, required: true },
    features: mongoose.Schema.Types.Mixed,
    photos: [String],
    checkInOut: {
        checkIn: { type: String, required: true },
        checkOut: { type: String, required: true }
    },
    _hotelId: { type: String, ref: 'Hotel', required: true }

})

const Room = mongoose.model("Room", RoomSchema)

module.exports = Room
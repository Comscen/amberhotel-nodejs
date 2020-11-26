var mongoose = require('mongoose')
var { nanoid } = require('nanoid')

const HotelSchema = new mongoose.Schema({
    _id: { type: String, default: () => nanoid(10) },
    email: { type: String, unique: true, required: true, dropDups: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    country: { type: String, required: true },
    city: { type: String, required: true },
    address: { type: String, required: true },
    postalCode: { type: String, required: true },
    rating: {type: mongoose.Decimal128},
    webPage: String,
    photo: String,
    photos: [String],
})

const Hotel = mongoose.model("Hotel", HotelSchema)

module.exports = Hotel
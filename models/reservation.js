var mongoose = require('mongoose')
var { nanoid } = require('nanoid')

const ReservationSchema = new mongoose.Schema({
    _id: { type: String, default: () => nanoid(10) },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    totalPrice: { type: Number, required: true },
    paid: { type: Boolean, required: true },
    finished: { type: Boolean, required: true },
    createdAt: { type: Date, default: Date.now, required: true },
    userData: {
        creditCard: { type: String, required: true },
        CVC: { type: Number, required: true },
        ccExpDate: { type: String, required: true },
        holderName: { type: String, required: true }
    },
    hotel: {type:String, ref: 'Hotel', required: true},
    room: { type: String, ref: 'Room', required: true },
    user: { type: String, ref: 'User', required: true }
})

const Reservation = mongoose.model('Reservation', ReservationSchema)

module.exports = Reservation
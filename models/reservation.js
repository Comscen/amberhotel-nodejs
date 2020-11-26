var mongoose = require('mongoose')
var { nanoid } = require('nanoid')

const ReservationSchema = new mongoose.Schema({
    _id: { type: String, default: () => nanoid(10), unique: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    totalPrice: { type: Number, required: true },
    paid: { type: Boolean, required: true },
    finished: { type: Boolean, required: true },
    createdAt: { type: Date, default: Date.now, required: true },
    userData:{
        creditCard: {type: String, required:true},
        CVC: {type: Number, required: true},
        ccExpDate:{type: String, required:true},
        holderName:{type: String, required: true}
    },
    _roomId: { type: String, ref: 'Room', required: true },
    _userId: { type: String, ref: 'User', required: true }
})

const Reservation = mongoose.model('Reservation', ReservationSchema)

module.exports = Reservation
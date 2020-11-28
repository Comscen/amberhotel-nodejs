var Hotel = require('../models/hotel')
var Room = require('../models/room')

exports.showHotels = async (req, res) => {
    await Hotel.find().lean().exec().then(results => {
        return res.render('listing/hotels.ejs', { hotels: results, session: req.session })
    }).catch(err => console.log(`CRITICAL ERROR DURING LISTING HOTELS:\n${err}`))
}

exports.showRooms = async (req, res) => {
    await Room.find().populate('hotel').lean().exec().then(rooms => {
        return res.render('listing/rooms.ejs', { rooms: rooms, session: req.session })
    }).catch(err => console.log(`CRITICAL ERROR DURING LISTING ROOMS:\n${err}`))
}
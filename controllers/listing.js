var Hotel = require('../models/hotel')
var Room = require('../models/room')

exports.showHotels = async (req, res) => {
    await Hotel.find().lean().exec().then(results => {
        return res.render('listing/hotels.ejs', { hotels: results, session: req.session })
    }).catch(err => console.log(`CRITICAL ERROR DURING LISTING HOTELS:\n${err}`))
}

exports.showRooms = async (req, res) => {
    await Room.find().populate('hotel').lean().exec().then(rooms => {
        if (rooms.length > 0)
            return res.render('listing/rooms.ejs', { rooms: rooms, session: req.session })
        return res.render('listing/rooms.ejs', {session: req.session })
    }).catch(err => console.log(`CRITICAL ERROR DURING LISTING ROOMS:\n${err}`))
}

exports.showSingleRoom = async (req, res) => {
    await Room.findOne({_id : req.params.id}).populate('hotel').lean().exec().then(result => {
        if (result == null) {
            return res.render('listing/room.ejs', { errors: [{ msg: 'Room ID is invalid!' }], session: req.session })
        }
        return res.render('listing/room.ejs', { room: result, session: req.session })
    }).catch(err => console.log(`CRITICAL ERROR DURING SHOWING ROOM:\n${err}`))
}
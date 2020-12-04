var c = require('calendar')
var Hotel = require('../models/hotel')
var Room = require('../models/room')
var Reservation = require('../models/reservation')

exports.showHotels = async (req, res) => {
    await Hotel.find().lean().exec().then(results => {
        return res.render('listing/hotels.ejs', { hotels: results, session: req.session })
    }).catch(err => console.log(`CRITICAL ERROR DURING LISTING HOTELS:\n${err}`))
}

exports.showRooms = async (req, res) => {
    await Room.find().populate('hotel').lean().exec().then(rooms => {
        if (rooms.length > 0)
            return res.render('listing/rooms.ejs', { rooms: rooms, session: req.session })
        return res.render('listing/rooms.ejs', { session: req.session })
    }).catch(err => console.log(`CRITICAL ERROR DURING LISTING ROOMS:\n${err}`))
}

exports.showSingleRoom = async (req, res) => {

    // new Reservation({
    //     startDate: new Date(2021,5,2),
    //     endDate: new Date(2021,5,6),
    //     totalPrice: 4000,
    //     paid: true,
    //     finished: false,
    //     createdAt: new Date(),
    //     userData: {
    //         creditCard: "3566002020360505",
    //         CVC: 924,
    //         ccExpDate: "03/21",
    //         holderName: "Michał Tangri"
    //     },
    //     room: "_ymOcjmt9g",
    //     user: "xKGmdv6I58"

    // }).save((err, result) => {
    //     if (!err) console.log("Added new reservation")
    // })

    let calendar = new c.Calendar(1)
    let currentYear = new Date().getFullYear()
    let currentMonth = new Date().getMonth()

    let calendarData = []

    for (let i = 0; i < 12; i++) {
        calendarData.push({month: currentMonth, year: currentYear, monthDays: calendar.monthDays(currentYear, currentMonth), unavailableDays: [] })

        if (currentMonth === 11) {
            currentMonth = 0
            currentYear++
        } else {
            currentMonth++
        }
    }
    
    await Room.findOne({ _id: req.params.id }).populate('hotel').lean().exec().then(room => {
        if (room == null) {
            return res.render('listing/room.ejs', { errors: [{ msg: 'Room ID is invalid!' }], session: req.session })
        }
        
        Reservation.find({ room: room._id }).select('startDate endDate').lean().exec().then(reservations => {
            
            if (reservations.length <= 0)
            return res.render('listing/room.ejs', { room: room, calendarData: calendarData, session: req.session })
            
            for (let reservation of reservations) {
                startDate = reservation.startDate
                endDate = reservation.endDate
                while (startDate <= endDate) {
                    calendarData.filter(obj => obj.month == startDate.getMonth())[0].unavailableDays.push(startDate.getDate())
                    startDate.setDate(startDate.getDate() + 1)
                }
            }
            return res.render('listing/room.ejs', { room: room, calendarData: calendarData, session: req.session })
        })

    }).catch(err => console.log(`CRITICAL ERROR DURING SHOWING ROOM:\n${err}`))
}
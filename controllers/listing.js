var c = require('calendar')
var Hotel = require('../models/hotel')
var Room = require('../models/room')
var Reservation = require('../models/reservation')
var User = require('../models/user')

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

    let calendar = new c.Calendar(1)
    let currentYear = new Date().getFullYear()
    let currentMonth = new Date().getMonth()

    let calendarData = []

    for (let i = 0; i < 12; i++) {
        calendarData.push({ month: currentMonth, year: currentYear, monthDays: calendar.monthDays(currentYear, currentMonth), unavailableDays: [] })

        if (currentMonth === 11) {
            currentMonth = 0
            currentYear++
        } else {
            currentMonth++
        }
    }

    await Room.findOne({ _id: req.params.id }).populate('hotel').lean().exec().then(room => {
        if (room == null) {
            return res.render('listing/room.ejs', { room: {}, errors: [{ msg: 'Room ID is invalid!' }], session: req.session })
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

exports.showReservationForm = async (req, res) => {

    if (!req.session.logged)
        return res.redirect('/login')

    await Room.findOne({ _id: req.params.id }).populate('hotel').lean().exec().then(room => {
        if (room == null)
            return res.render('listing/reservation.ejs', { errors: [{ msg: 'Invalid room ID!' }], session: req.session })
        return res.render('listing/reservation.ejs', { room: room, session: req.session })
    })
}

//TEN HANDLER MA ZNIKOME ZABEZPIECZENIA I NIE SPRAWDZA ZAJĘTYCH TERMINÓW - DOKOŃCZYĆ!
//TEN HANDLER MA ZNIKOME ZABEZPIECZENIA I NIE SPRAWDZA ZAJĘTYCH TERMINÓW - DOKOŃCZYĆ!
//TEN HANDLER MA ZNIKOME ZABEZPIECZENIA I NIE SPRAWDZA ZAJĘTYCH TERMINÓW - DOKOŃCZYĆ!
//TEN HANDLER MA ZNIKOME ZABEZPIECZENIA I NIE SPRAWDZA ZAJĘTYCH TERMINÓW - DOKOŃCZYĆ!
//TEN HANDLER MA ZNIKOME ZABEZPIECZENIA I NIE SPRAWDZA ZAJĘTYCH TERMINÓW - DOKOŃCZYĆ!
//TEN HANDLER MA ZNIKOME ZABEZPIECZENIA I NIE SPRAWDZA ZAJĘTYCH TERMINÓW - DOKOŃCZYĆ!
//TEN HANDLER MA ZNIKOME ZABEZPIECZENIA I NIE SPRAWDZA ZAJĘTYCH TERMINÓW - DOKOŃCZYĆ!
//TEN HANDLER MA ZNIKOME ZABEZPIECZENIA I NIE SPRAWDZA ZAJĘTYCH TERMINÓW - DOKOŃCZYĆ!
exports.handleReservationForm = async (req, res) => {

    if (!req.session.logged)
        return res.redirect('/login')

    await Room.findOne({ _id: req.params.id }).populate('hotel').lean().exec().then(room => {
        let startDateArray = req.body.reservationBegin.split('-')
        let endDateArray = req.body.reservationEnd.split('-')
        let expirationDateArray = req.body.expirationDate.split('-')

        let startDate = new Date(startDateArray[0], startDateArray[1] - 1, startDateArray[2])
        let endDate = new Date(endDateArray[0], endDateArray[1] - 1, endDateArray[2])

        if (startDate >= endDate) {
            return res.render('listing/reservation.ejs', {room: room, errors: [{ msg: 'Start date cannot be greater or equal to end date!' }], session: req.session })
        }

        let totalCost = 0
        while (startDate < endDate) {
            totalCost += room.price
            startDate.setDate(startDate.getDate() + 1)
        }

        new Reservation({
            startDate: new Date(startDateArray[0], startDateArray[1] - 1, startDateArray[2]),
            endDate: endDate,
            totalPrice: totalCost,
            paid: true,
            finished: false,
            createdAt: new Date(),
            userData: {
                creditCard: req.body.creditcard,
                CVC: req.body.cvc,
                ccExpDate: new Date(expirationDateArray[0], expirationDateArray[1] - 1),
                holderName: req.body.credentials
            },
            room: room._id,
            user: req.session.userId
        }).save((err, result) => {
            if (err) {
                return res.render('listing/reservation.ejs', {room: room, errors: [{ msg: 'Something went wront! Please try again later' }], session: req.session })
            }
            return res.render('listing/reservation.ejs', {room: room, messages: [{ msg: 'Reservation completed!' }], session: req.session })
        })
    }).catch(err => console.log(`CRITICAL GET ERROR WHILE CREATING RESERVATION:\n${err}`))
}
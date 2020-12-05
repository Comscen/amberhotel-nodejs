var c = require('calendar')
const { body, validationResult } = require("express-validator")
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

//DZIEJĄ SIĘ TU RZECZY KTÓRE SIĘ PROGRAMISTOM NIE ŚNIŁY I TRZEBA ZWRACAĆ UWAGĘ CZY DATY SIĘ ZGADZAJĄ
exports.handleReservationForm = async (req, res) => {

    let currentDate = new Date()

    await body('expirationDate').custom(expDate => {
        expDate = expDate.split('-')
        if (new Date(expDate[0], expDate[1] - 1, 1) <= new Date(currentDate.getFullYear(), currentDate.getMonth(), 1))
            return Promise.reject('Your card has expired!')
        return Promise.resolve('')
    }).run(req)

    await body('cvc').isLength({ min: 3, max: 3 }).withMessage('CVC/CVV is a 3 digit number!').run(req)

    await body('creditcard').isCreditCard().withMessage('Invalid credit card number!').run(req)

    if (!req.session.logged)
        return res.redirect('/login')

    const errors = validationResult(req).array()

    await Room.findOne({ _id: req.params.id }).populate('hotel').lean().exec().then(async room => {
        if (errors.length === 0) {
            let startDateArray = req.body.reservationBegin.split('-')
            let endDateArray = req.body.reservationEnd.split('-')
            let expirationDateArray = req.body.expirationDate.split('-')

            let startDate = new Date(startDateArray[0], startDateArray[1] - 1, startDateArray[2])
            let endDate = new Date(endDateArray[0], endDateArray[1] - 1, endDateArray[2])


            if (startDate >= endDate) {
                return res.render('listing/reservation.ejs', { room: room, errors: [{ msg: 'Start date cannot be greater or equal to end date!' }], session: req.session })
            }

            if (startDate < new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())) {
                return res.render('listing/reservation.ejs', { room: room, errors: [{ msg: 'Start date cannot be in the past!' }], session: req.session })
            }

            if (endDate < new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, currentDate.getDate() + 1)) {
                return res.render('listing/reservation.ejs', { room: room, errors: [{ msg: 'You cannot book a room for more than 11 months ahead!' }], session: req.session })
            }

            await Reservation.find({ room: req.params.id }).select('startDate endDate').lean().exec().then(reservations => {

                let resetStartDate = new Date(startDateArray[0], startDateArray[1] - 1, startDateArray[2])
                endDate.setDate(endDate.getDate() - 1)

                for (reservation of reservations) {
                    if (resetStartDate >= reservation.startDate && resetStartDate <= reservation.endDate)
                        return res.render('listing/reservation.ejs', { room: room, errors: [{ msg: 'This term is already booked!' }], session: req.session })
                    if (endDate >= reservation.startDate && endDate <= reservation.endDate)
                        return res.render('listing/reservation.ejs', { room: room, errors: [{ msg: 'This term is already booked!' }], session: req.session })
                }

                let totalCost = 0
                while (startDate < endDate) {
                    totalCost += room.price
                    startDate.setDate(startDate.getDate() + 1)
                }

                new Reservation({
                    startDate: resetStartDate,
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
                        return res.render('listing/reservation.ejs', { room: room, errors: [{ msg: 'Something went wront! Please try again later' }], session: req.session })
                    }
                    return res.render('listing/reservation.ejs', { room: room, messages: [{ msg: 'Reservation completed!' }], session: req.session })
                })

            }).catch(err => console.log(`CRITICAL GET RESERVATIONS ERROR WHILE CREATING RESERVATION:\n${err}`))
        } else {
            return res.render('listing/reservation.ejs', { room: room, errors: errors, session: req.session })
        }

    }).catch(err => console.log(`CRITICAL GET ROOM ERROR WHILE CREATING RESERVATION:\n${err}`))
}
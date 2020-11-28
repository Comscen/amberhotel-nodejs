const session = require("express-session")
const { body, validationResult } = require("express-validator")
const { where } = require("../models/room")
const Room = require("../models/room")

exports.showDashboard = async (req, res) => {
    if (!req.session.logged) {
        return res.redirect('/login')
    }
    if (typeof req.session.business == 'undefined') {
        return res.render('index.ejs', { session: req.session, errors: [{ msg: 'You cannot add a room if your account type is NOT business!' }] })
    }
    
    await Room.find({hotel: req.session.userId}).lean().exec().then(results =>{
        if(results.length > 0){
            return res.render('dashboard/dashboard.ejs', {rooms: results, session: req.session })
        }
        return res.render('dashboard/dashboard.ejs', {session: req.session, errors: [{msg: 'Something went wrong'}] })
    }).catch(error => console.log(`Error during hotel rooms query: ${error}`))
    
}

exports.showAddRoomForm = async (req, res) => {
    if (!req.session.logged) {
        return res.redirect('/login')
    }
    if (typeof req.session.business == 'undefined') {
        return res.render('index.ejs', { session: req.session, errors: [{ msg: 'You cannot add a room if your account type is NOT business!' }] })
    }
    return res.render('dashboard/addRoom.ejs', { session: req.session })
}

exports.handleAddRoomForm = [

    // Room name - letters, numbers and '-' sign ex. Two-person room
    body('name').trim()
        .matches('#TODO').withMessage('Name cannot contain special characters')
        .isLength({ min: 5, max: 64 }).withMessage('Name must be between 5 and 64 characters long'),
    // Description - letters, numbers, ',' and '.', 
    body('description').trim()
        .matches('#TODO').withMessage('Description cannot contain special characters except for period and comma')
        .escape(),
    // Price - numbers only
    body('price').trim()
        .matches('#TODO').withMessage('Price can only contain digits!')
        .escape(),
    // Beds - numbers only
    body('beds').trim().notEmpty()
        .matches('#TODO').withMessage('Number of beds can only contain digits!')
        .escape(),
    // Capacity - numbers only
    body('capacity').trim().notEmpty()
        .matches('#TODO').withMessage('Number of people can only contain digits!')
        .escape(),
    // Standard - select one menu
    body('standard').trim().isIn(['Standard', 'Exclusive', 'Deluxe', 'Premium'])
        .escape(),
    // Photos - array of URLs
    body('photos').trim()
        .isURL(true).withMessage('Photo URL has to be a valid URL!'),
    // Check in and check out - time
    body('checkIn').trim()
        .escape(),
    body('checkOut').trim()
        .escape(),

    async (req, res) => {
        if (!req.session.logged) {
            return res.redirect('/login')
        }
        if (typeof req.session.business == 'undefined') {
            return res.render(`index.ejs`, { session: req.session, errors: [{ msg: 'You cannot add a room if your account type is NOT business!' }] })
        }

        const errors = validationResult(req).array()

        if (errors.length === 0) {
            new Room({
                name: req.body.name,
                description: req.body.description,
                price: req.body.price,
                beds: req.body.beds,
                capacity: req.body.capacity,
                standard: req.body.standard,
                // features: #TODO ,
                photos: req.body.photos,
                checkInOut: {
                    checkIn: req.body.checkIn,
                    checkOut: req.body.checkOut
                },
                hotel: req.session.userId
            }).save((error, obj) => {
                if (error) {
                    console.log(`Error saving room: ${error}`)
                    return res.render('dashboard/dashboard.ejs', { errors: [{ msg: 'There was an error adding the room' }], session: req.session })
                }
                return res.render('dashboard/dashboard.ejs', { messages: [{ msg: 'You have successfully added the room' }], session: req.session })
            })
        } else {
            return res.render('dashboard/addRoom.ejs', { errors: errors, session: req.session })
        }
    }
]
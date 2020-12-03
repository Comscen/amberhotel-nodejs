const { body, validationResult } = require("express-validator")
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
        return res.render('dashboard/dashboard.ejs', {session: req.session})
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
        .matches(/^[^\\W]{0}[\p{L}\d\s\-0-9]{0,}$/u).withMessage('Name can contain alphanumeric characters, "&", spaces and "-"!')
        .isLength({ min: 5, max: 64 }).withMessage('Name must be between 5 and 64 characters long'),

    // Description - letters, numbers, ',' and '.', 
    body('description').trim()
        .matches(/^[^\\W]{0}[0-9]{0,}[\p{L}\d\s\-&.,!?'"]{0,}$/u).withMessage('Description cannot contain special characters except for period and comma'),

    // Price - numbers only
    body('price').trim()
        .notEmpty().withMessage('Price cannot be empty!')
        .isNumeric().withMessage('Price has to be a number!')
        .custom(price => {
            if(parseInt(price) < 0) return Promise.reject('Price cannot be lower than zero!')
            return Promise.resolve('')
        })
        .escape(),

    // Beds - numbers only
    body('beds').trim()
        .notEmpty().withMessage('Number of beds cannot be empty!')
        .isNumeric().withMessage('Number of beds has to be a number')
        .custom(beds => {
            if (parseInt(beds) < 1) {
                return Promise.reject('You need to specify atleast one bed in your room!');
            } 
            return Promise.resolve('')
        })
        .escape(),

    // Capacity - numbers only
    body('capacity').trim()
        .notEmpty().withMessage('Number of people cannot be empty!')
        .isNumeric().withMessage('Number of people has to be a number!')
        .custom(capacity => {
            if(parseInt(capacity) < 1) return Promise.reject('Number of people in a room has to be atleast 1')
            return Promise.resolve('')
        })
        .escape(),

    // Standard - select one menu
    body('standard').trim()
        .isIn(['Standard', 'Exclusive', 'Deluxe', 'Premium']).withMessage('Invalid standard!')
        .escape(),

    // Photos - array of URLs
    // body('photos').trim()
        // .isURL(true).withMessage('Photo URL has to be a valid URL!'),
        
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
                features: req.body.features,
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
                Room.find({hotel: req.session.userId}).lean().exec().then(rooms => {
                    return res.render('dashboard/dashboard.ejs', {rooms: rooms, messages: [{ msg: 'You have successfully added the room' }], session: req.session })
                })
            })
        } else {
            return res.render('dashboard/addRoom.ejs', { errors: errors, session: req.session })
        }
    }
]

exports.showEditRoomForm = async (req, res) => {
    if (!req.session.logged) {
        return res.redirect('/login')
    }
    if (typeof req.session.business == 'undefined') {
        return res.render('index.ejs', { session: req.session, errors: [{ msg: 'You cannot add a room if your account type is NOT business!' }] })
    }

    await Room.findOne({_id: req.params.id, hotel: req.session.userId}).lean().exec().then(result =>{
        if(result != null){
            return res.render('dashboard/editRoom.ejs', {room: result, session: req.session })
        }
        return res.render('dashboard/dashboard.ejs', {session: req.session, errors: [{msg: 'Something went wrong test'}] })
    }).catch(error => console.log(`Error during hotel rooms query: ${error}`))

}

exports.handleEditRoomForm = [
    // Room name - letters, numbers and '-' sign ex. Two-person room
    body('name').trim()
        .matches(/^[^\\W]{0}[\p{L}\d\s\-0-9]{0,}$/u).withMessage('Name can contain alphanumeric characters, "&", spaces and "-"!')
        .isLength({ min: 5, max: 64 }).withMessage('Name must be between 5 and 64 characters long'),
    // Description - letters, numbers, ',' and '.', 
    body('description').trim()
        .matches(/^[^\\W]{0}[0-9]{0,}[\p{L}\d\s\-&.,!?'"]{0,}$/u).withMessage('Description cannot contain special characters except for period and comma'),
    // Price - numbers only
    body('price').trim()
        .notEmpty().withMessage('Price cannot be empty!')
        .isNumeric().withMessage('Price has to be a number!')
        .custom(price => {
            if(parseInt(price) < 0) return Promise.reject('Price cannot be lower than zero!')
            return Promise.resolve('')
        })
        .escape(),
    // Beds - numbers only
    body('beds').trim()
        .notEmpty().withMessage('Number of beds cannot be empty!')
        .isNumeric().withMessage('Number of beds has to be a number')
        .custom(beds => {
            if (parseInt(beds) < 1) {
                return Promise.reject('You need to specify atleast one bed in your room!');
            } 
            return Promise.resolve('')
        })
        .escape(),
    // Capacity - numbers only
    body('capacity').trim()
        .notEmpty().withMessage('Number of people cannot be empty!')
        .isNumeric().withMessage('Number of people has to be a number!')
        .custom(capacity => {
            if(parseInt(capacity) < 1) return Promise.reject('Number of people in a room has to be atleast 1')
            return Promise.resolve('')
        })
        .escape(),
    // Standard - select one menu
    body('standard').trim()
        .isIn(['Standard', 'Exclusive', 'Deluxe', 'Premium']).withMessage('Invalid standard!')
        .escape(),
    // Photos - array of URLs
    // body('photos').trim()
        // .isURL(true).withMessage('Photo URL has to be a valid URL!'),
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
       
    }

]

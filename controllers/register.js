const { body, check, validationResult } = require('express-validator')
const postalCodes = require('postal-codes-js')
const bcrypt = require('bcrypt')
var User = require('../models/user')
var Hotel = require('../models/hotel')

async function emailAlreadyInDatabase(email, accountType) {
    var alreadyExists;

    var queries = [
        await User.findOne({email: email}).select('email').exec(),
        await Hotel.findOne({email: email}).select('email').exec()
    ]

    await Promise.all(queries).then(results => {
        if (results[0] != null || results[1] != null)
            alreadyExists = true
    })

    if (alreadyExists)
        return Promise.reject('E-mail already in use!')
}

exports.showRegisterForm = (req, res) => {
    return res.render('authorization/register.ejs', { session: req.session })
}

exports.showHotelRegisterForm = (req, res) => {
    return res.render('authorization/registerHotel.ejs', { session: req.session })
}

exports.handleRegisterForm = [

    body('name').trim()
        .matches(/^[^0-9]{0}[^\\W]{0}[\p{L}]{0,}$/u).withMessage('Name cannot contain numbers and special characters.')
        .isLength({ min: 1, max: 50 }).withMessage('Name must be between 1 and 50 characters long.')
        .escape(),

    body('surname').trim()
        .matches(/^[^0-9]{0}[^\\W]{0}[\p{L}]{0,}$/u).withMessage('Surname cannot contain numbers and special characters.')
        .isLength({ min: 1, max: 50 }).withMessage('Surname must be between 1 and 50 characters long.')
        .escape(),

    body('email').trim()
        .isLength({ min: 1 }).withMessage('E-mail cannot be empty!')
        .isEmail().withMessage('Invalid e-mail!')
        .custom(email => emailAlreadyInDatabase(email)),

    body('password').trim()
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*#?]{0,}/).withMessage('Password must contain at least one small letter, one big letter and one digit.')
        .isLength({ min: 5, max: 30 }).withMessage('Password must be between 5 and 30 characters long.'),

    async (req, res) => {
        const validationResults = validationResult(req)
        const errors = validationResults.array();

        if (req.body.password !== req.body.repeatPassword)
            errors.push({ msg: 'Passwords do not match!' })

        if (errors.length === 0) {
            new User({
                email: req.body.email,
                password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10)),
                name: req.body.name,
                surname: req.body.surname,
                joined: new Date()
            }).save((error, obj) => {
                if (error) {
                    console.log(`Database error while creating new account: ${error}`)
                    return res.render('authorization/register.ejs', { 
                        errors: [{ msg: 'There was a problem while creating your account. Please try again later.' }], 
                        session: req.session })
                } else {
                    return res.render('index.ejs', { messages: [{ msg: 'New account created! You can now sign in.' }], session: req.session })
                }

            })
        } else {
            return res.render('authorization/register.ejs', { errors: errors, session: req.session })
        }
    }

]

exports.handleHotelRegisterForm = [

    body('email').trim()
        .isLength({ min: 1 }).withMessage('E-mail cannot be empty!')
        .isEmail().withMessage('Invalid e-mail!')
        .custom(email => emailAlreadyInDatabase(email)),

    body('password').trim()
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%&*#?]{0,}/).withMessage('Password must contain at least one small letter, one big letter and one digit.')
        .isLength({ min: 5, max: 30 }).withMessage('Password must be between 5 and 30 characters long.'),

    body('hotelName').trim()
        .isLength({min: 3, max: 64}).withMessage('Hotel name must be between 3 and 64 characters long.'),

    body('address').trim()
        .matches(/^[\p{L}. .'0-9.-.&]{0,}$/u).withMessage('Address cannot special characters other than "&", "-" and "\'".')
        .isLength({ min: 3, max: 64 }).withMessage('Address name must be between 3 and 64 characters long.'),

    body('country').trim()
        .isIn(['Poland', 'Germany', 'Austria', 'France', 'Denmark']).withMessage('Invalid country.')
        .escape(),

    body('city').trim()
        .matches(/^[\p{L}\d\W]{1,85}$/u).withMessage('City name cannot be empty or longer than 85 characters'),

    async (req, res) => {

        const countryCodes = {
            Poland: 'PL',
            Germany: 'DE',
            Austria: 'AT',
            France: 'FR',
            Denmark: 'DK'
        }

        const validationResults = validationResult(req)
        const errors = validationResults.array();

        if (req.body.password !== req.body.repeatPassword)
            errors.push({ msg: 'Passwords do not match!' })

        let postalCode = req.body.postal
        let country = req.body.country

        const postalCodeValid = postalCodes.validate(countryCodes[country], postalCode)

        if (postalCodeValid !== true)
            errors.push({msg: `Invalid postal code for ${country}`})

        if (errors.length === 0) {
            var newHotel = new Hotel({
                email: req.body.email,
                password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10)),
                name: req.body.hotelName,
                country: country,
                city: req.body.city,
                address: req.body.address,
                postalCode: postalCode,
                webPage: undefined,
                photo: undefined
            })
            
            let webPage = req.body.web
            let photo = req.body.photo

            if (webPage !== '')
                newHotel.webPage = webPage

            if (photo !== '')
                newHotel.photo = photo
            
            newHotel.save((error, obj) => {
                if (error) {
                    console.log(`Database error while creating new business account: ${error}`)
                    return res.render('authorization/registerHotel.ejs', { 
                        errors: [{ msg: 'There was a problem while creating your business account. Please try again later.' }], 
                        session: req.session 
                        })
                } else {
                    return res.render('index.ejs', { messages: [{ msg: 'New business account created! You can now sign in.' }], session: req.session })
                }

            })
        } else {
            return res.render('authorization/registerHotel.ejs', {errors: errors, session: req.session})
        }
    }
]
const { body, check, validationResult } = require('express-validator')
const bcrypt = require('bcrypt')
var User = require('../models/user')

async function emailAlreadyInDatabase(email) {
    var alreadyExists;
    await User.find({ email: email }, (err, results) => {
        if (results.length > 0)
            alreadyExists = true;
        else
            alreadyExists = false;
    })

    if (alreadyExists)
        return Promise.reject('E-mail already in use!')
}

exports.showRegisterForm = (req, res) => {
    res.render('register.ejs', {session: req.session})
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
        .custom(email => emailAlreadyInDatabase(email))
        .escape(),

    body('password').trim()
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*#?]{0,}/).withMessage('Password must contain at least one small letter, one big letter and one digit.')
        .isLength({ min: 5, max: 30 }).withMessage('Password must be between 5 and 30 characters long.')
        .escape(),

    async (req, res) => {
        const validationResults = validationResult(req)
        const errors = validationResults.array();

        if (req.body.password !== req.body.repeatPassword)
            errors.push({msg: 'Passwords do not match!'})

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
                    return res.render('register.ejs', {errors: [{msg: 'There was a problem while creating your account. Please try again later.'}], session: req.session})
                } else {
                    console.log(`Successfully created new user account with e-mail: ${req.body.email}`)
                    return res.render('index.ejs', {messages: [{msg: 'New account created! You can now sign in.'}], session: req.session})
                }

            })
        } else {
            return res.render('register.ejs', {errors: errors, session: req.session})
        }
    }

]
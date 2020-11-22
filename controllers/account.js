var { body, validationResult, oneOf } = require('express-validator')
var bcrypt = require('bcrypt')
var postalCodes = require('postal-codes-js')
var User = require('../models/user')
var Hotel = require('../models/hotel')

async function emailUnavailable(req) {
    var emailIsUnavailable = false
    await User.findOne({ email: req.body.email }, (err, result) => {
        if (result && result._id !== req.session.userId)
            emailIsUnavailable = true
    })

    if (!emailIsUnavailable) {
        await Hotel.findOne({ email: req.body.email }, (err, result) => {
            if (result && result._id !== req.session.userId)
                emailIsUnavailable = true
        })
    }

    return emailIsUnavailable
}

const handleEditForm = async (req, res) => {

    await body('name').trim()
        .matches(/^[^0-9]{0}[^\\W]{0}[\p{L}]{0,}$/u).withMessage('Name cannot contain numbers and special characters.')
        .isLength({ min: 1, max: 50 }).withMessage('Name must be between 1 and 50 characters long.')
        .escape().run(req)

    await body('surname').trim()
        .matches(/^[^0-9]{0}[^\\W]{0}[\p{L}]{0,}$/u).withMessage('Surname cannot contain numbers and special characters.')
        .isLength({ min: 1, max: 50 }).withMessage('Surname must be between 1 and 50 characters long.')
        .escape().run(req)

    await body('email').trim()
        .isLength({ min: 1 }).withMessage('E-mail cannot be empty!')
        .isEmail().withMessage('Invalid e-mail!')
        .escape().run(req)

    if (!req.session.logged)
        req.redirect('/login')

    const errors = validationResult(req).array()

    var user
    await User.findOne({ _id: req.session.userId }, (err, result) => { user = result })

    if (errors.length === 0) {
        let location = req.body.location
        let photo = req.body.photo
        let email = req.body.email

        user.name = req.body.name
        user.surname = req.body.surname

        if (location !== '')
            user.location = location
        else if (typeof user.location != 'undefined')
            user.location = undefined


        if (photo !== '')
            user.photo = photo
        else if (typeof user.photo != 'undefined')
            user.photo = undefined

        if (await emailUnavailable(req)) {
            user.save()
            return res.render('accounts/editAccount.ejs', {
                user: user,
                errors: [{ msg: 'E-mail already taken!' }],
                session: req.session
            })
        }

        user.email = email
        user.save()
        return res.render('accounts/editAccount.ejs', { user: user, messages: [{ msg: 'Changes saved successfully.' }], session: req.session })

    } else {
        return res.render('accounts/editAccount.ejs', { user: user, errors: errors, session: req.session })
    }
}

const handleHotelEditForm = async (req, res) => {

    await body('email').trim()
        .isLength({ min: 1 }).withMessage('E-mail cannot be empty!')
        .isEmail().withMessage('Invalid e-mail!').run(req)

    await body('hotelName').trim()
        .isLength({ min: 3, max: 64 }).withMessage('Hotel name must be between 3 and 64 characters long.').run(req)

    await body('address').trim()
        .matches(/^[\p{L}. .'0-9.-.&]{0,}$/u).withMessage('Address cannot special characters other than "&", "-" and "\'".')
        .isLength({ min: 3, max: 64 }).withMessage('Address name must be between 3 and 64 characters long.').run(req)

    await body('country').trim()
        .isIn(['Poland', 'Germany', 'Austria', 'France', 'Denmark']).withMessage('Invalid country.')
        .escape().run(req)

    await body('city').trim()
        .matches(/^[\p{L}\d\W]{1,85}$/u).withMessage('City name cannot be empty or longer than 85 characters').run(req)

    if (!req.session.logged)
        req.redirect('/login')

    const errors = validationResult(req).array()

    var user
    await Hotel.findOne({ _id: req.session.userId }, (err, result) => { user = result })

    if (errors.length === 0) {
        let webPage = req.body.web
        let photo = req.body.photo
        let email = req.body.email

        user.name = req.body.hotelName
        user.country = req.body.country
        user.city = req.body.city
        user.address = req.body.address
        user.postalCode = req.body.postal

        if (webPage !== '')
            user.webPage = webPage
        else if (typeof user.webPage != 'undefined')
            user.webPage = undefined


        if (photo !== '')
            user.photo = photo
        else if (typeof user.photo != 'undefined')
            user.photo = undefined

        if (await emailUnavailable(req)) {
            user.save()
            return res.render('accounts/editAccount.ejs', {
                user: user,
                errors: [{ msg: 'E-mail already taken!' }],
                session: req.session
            })
        }

        user.email = email
        user.save()
        return res.render('accounts/editAccount.ejs', { user: user, messages: [{ msg: 'Changes saved successfully.' }], session: req.session })

    } else {
        return res.render('accounts/editAccount.ejs', { user: user, errors: errors, session: req.session })
    }
}

exports.showAccount = async (req, res) => {
    var queries = [
        await User.findOne({ _id: req.params.id }).lean().exec(),
        await Hotel.findOne({ _id: req.params.id }).lean().exec(),
    ]

    await Promise.all(queries).then(results => {
        if (results[0] !== null) {
            results[0].joined = results[0].joined.toISOString().substr(0, 10)
            return res.render('accounts/account.ejs', { user: results[0], session: req.session })
        } else if (results[1] !== null) {
            return res.render('accounts/account.ejs', { user: results[1], session: req.session })
        } else {
            return res.render('accounts/account.ejs', { errors: [{ msg: 'Account ID is invalid!' }], user: {}, session: req.session })
        }
    }).catch(err => console.log(`CRITICAL ERROR DURING LOADING ACCOUNT PAGE:\n${err}`))
}

exports.showEditForm = async (req, res) => {

    if (!req.session.logged)
        return res.redirect('/login')

    if (req.params.id != req.session.userId)
        return res.redirect(`/account/${req.session.userId}`)

    var queries = [
        await User.findOne({ _id: req.params.id }).lean().exec(),
        await Hotel.findOne({ _id: req.params.id }).lean().exec(),
    ]

    await Promise.all(queries).then(results => {
        if (results[0] !== null)
            return res.render('accounts/editAccount.ejs', { user: results[0], session: req.session })
        else if (results[1] !== null)
            return res.render('accounts/editAccount.ejs', { user: results[1], session: req.session })
        else
            return res.render('accounts/editAccount.ejs', { errors: [{ msg: 'Something went wrong. Please try again later.' }], session: req.session })
    }).catch(err => console.log(`CRITICAL ERROR DURING LOADING EDIT ACCOUNT PAGE:\n${err}`))
}

exports.showEditPasswordForm = async (req, res) => {
    if (!req.session.logged)
        return res.redirect('/login')

    if (req.params.id != req.session.userId)
        return res.redirect("/account")

    var queries = [
        await User.findOne({ _id: req.params.id }).lean().exec(),
        await Hotel.findOne({ _id: req.params.id }).lean().exec(),
    ]

    await Promise.all(queries).then(results => {
        if (results[0] !== null)
            return res.render('accounts/editAccountPassword.ejs', { session: req.session })
        else if (results[1] !== null)
            return res.render('accounts/editAccountPassword.ejs', { session: req.session })
        else
            return res.render('accounts/editAccountPassword.ejs', { errors: [{ msg: 'Something went wrong. Please try again later.' }], session: req.session })
    }).catch(err => console.log(`CRITICAL ERROR DURING LOADING EDIT ACCOUNT PAGE (PASSWORD):\n${err}`))
}

exports.chooseHandlerForEditForm = async (req, res) => {
    if (typeof req.session.business == 'undefined') {
        handleEditForm(req, res)
    } else {
        handleHotelEditForm(req, res)
    }
}

exports.handleEditPasswordForm = [

    body('password').trim()
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*#?]{0,}/).withMessage('Password must contain at least one small letter, one big letter and one digit.')
        .isLength({ min: 5, max: 30 }).withMessage('Password must be between 5 and 30 characters long.'),

    async (req, res) => {

        if (!req.session.logged)
            req.redirect('/login')

        const errors = validationResult(req).array()
        let oldPassword = req.body.oldPassword
        let newPassword = req.body.password

        if (oldPassword === '')
            errors.push({ msg: 'Current password cannot be empty!' })

        if (newPassword !== req.body.repeatPassword)
            errors.push({ msg: 'Passwords do not match!' })

        var queries = [
            await User.findOne({ _id: req.session.userId }).exec(),
            await Hotel.findOne({ _id: req.session.userId }).exec(),
        ]

        if (errors.length === 0) {
            await Promise.all(queries).then(results => {
                var user;
                if (results[0] !== null)
                    user = results[0]
                else if (results[1] !== null)
                    user = results[1]

                if (typeof user == 'undefined')
                    return res.render('accounts/editAccountPassword.ejs', { errors: [{ msg: 'Something went wrong. Please try again later.' }], session: req.session })

                if (!bcrypt.compareSync(oldPassword, user.password))
                    return res.render('accounts/editAccountPassword.ejs', { errors: [{ msg: 'Old password is incorrect!' }], session: req.session })

                user.password = bcrypt.hashSync(newPassword, bcrypt.genSaltSync(10))
                user.save()
                return res.render('accounts/editAccountPassword.ejs', { messages: [{ msg: 'Password changed successfully.' }], session: req.session })

            }).catch(err => console.log(`CRITICAL ERROR DURING HANDLIG EDIT ACCOUNT PAGE (PASSWORD):\n${err}`))
        } else {
            return res.render('accounts/editAccountPassword.ejs', { errors: errors, session: req.session })
        }
    }
]
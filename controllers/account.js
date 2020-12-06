var { body, validationResult, oneOf } = require('express-validator')
var bcrypt = require('bcrypt')
var postalCodes = require('postal-codes-js')
var User = require('../models/user')
var Hotel = require('../models/hotel')
var Room = require('../models/room')
var Comment = require('../models/comment')

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
    let isEmailUnavailable = await emailUnavailable(req)

    await User.findOne({ _id: req.session.userId }, (err, result) => {
        if (errors.length === 0) {
            let location = req.body.location
            let photo = req.body.photo
            let email = req.body.email

            result.name = req.body.name
            result.surname = req.body.surname

            if (location !== '')
                result.location = location
            else if (typeof result.location != 'undefined')
                result.location = undefined


            if (photo !== '')
                result.photo = photo
            else if (typeof result.photo != 'undefined')
                result.photo = undefined

            if (isEmailUnavailable) {
                result.save()
                return res.render('accounts/editAccount.ejs', {
                    user: result,
                    errors: [{ msg: 'E-mail already taken!' }],
                    session: req.session
                })
            }

            result.email = email
            result.save()
            return res.render('accounts/editAccount.ejs', { user: result, messages: [{ msg: 'Changes saved successfully.' }], session: req.session })

        } else {
            return res.render('accounts/editAccount.ejs', { user: result, errors: errors, session: req.session })
        }
    })
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

    const countryCodes = {
        Poland: 'PL',
        Germany: 'DE',
        Austria: 'AT',
        France: 'FR',
        Denmark: 'DK'
    }

    if (!req.session.logged)
        req.redirect('/login')

    const errors = validationResult(req).array()

    const postalCodeValid = postalCodes.validate(countryCodes[req.body.country], req.body.postal)

    if (postalCodeValid !== true)
        errors.push({ msg: `Invalid postal code for ${req.body.country}` })

    let isEmailUnavailable = await emailUnavailable(req)

    await Hotel.findOne({ _id: req.session.userId }, (err, result) => {
        if (errors.length === 0) {
            let webPage = req.body.web
            let photo = req.body.photo
            let email = req.body.email

            result.name = req.body.hotelName
            result.country = req.body.country
            result.city = req.body.city
            result.address = req.body.address
            result.postalCode = req.body.postal

            if (webPage !== '')
                result.webPage = webPage
            else if (typeof result.webPage != 'undefined')
                result.webPage = undefined

            if (photo !== '')
                result.photo = photo
            else if (typeof result.photo != 'undefined')
                result.photo = undefined

            if (isEmailUnavailable) {
                result.save()
                return res.render('accounts/editAccount.ejs', {
                    user: result,
                    errors: [{ msg: 'E-mail already taken!' }],
                    session: req.session
                })
            }

            result.email = email
            result.save()
            return res.render('accounts/editAccount.ejs', { user: result, messages: [{ msg: 'Changes saved successfully.' }], session: req.session })

        } else {
            return res.render('accounts/editAccount.ejs', { user: result, errors: errors, session: req.session })
        }
    })


}

exports.showAccount = async (req, res) => {
    var queries = [
        await User.findOne({ _id: req.params.id }).lean().exec(),
        await Hotel.findOne({ _id: req.params.id }).lean().exec(),
    ]

    await Promise.all(queries).then(async results => {
        if (results[0] !== null) {
            results[0].joined = results[0].joined.toISOString().substr(0, 10)

            var queries = [
                await Comment.find({ user: req.params.id, byUser: false }).populate('hotel').lean().exec(),
                await Comment.find({ user: req.params.id, byUser: true }).populate('hotel').lean().exec()
            ]

            await Promise.all(queries).then(additionalData => {
                if (additionalData[0].length == 0 && additionalData[1].length == 0)
                    return res.render('accounts/account.ejs', { user: results[0], session: req.session })
                else if (additionalData[0].length == 0)
                    return res.render('accounts/account.ejs', { user: results[0], commentsByUser: additionalData[1], session: req.session })
                else if (additionalData[1].length == 0)
                    return res.render('accounts/account.ejs', { user: results[0], commentsAboutUser: additionalData[0], session: req.session })
                else
                    return res.render('accounts/account.ejs', { user: results[0], commentsAboutUser: additionalData[0], commentsByUser: additionalData[1], session: req.session })
            })

        } else if (results[1] !== null) {

            var queries = [
                await Room.find({ hotel: req.params.id }).populate('hotel').lean().exec(),
                await Comment.find({ hotel: req.params.id, byUser: true }).populate('user').lean().exec()
            ]

            await Promise.all(queries).then(additionalData => {
                if (additionalData[0].length == 0 && additionalData[1].length == 0)
                    return res.render('accounts/account.ejs', { user: results[1], session: req.session })
                else if (additionalData[0].length == 0)
                    return res.render('accounts/account.ejs', { user: results[1], commentsAboutHotel: additionalData[1], session: req.session })
                else if (additionalData[1].length == 0)
                    return res.render('accounts/account.ejs', { user: results[1], rooms: additionalData[0], session: req.session })
                else
                    return res.render('accounts/account.ejs', { user: results[1], rooms: additionalData[0], commentsAboutHotel: additionalData[1], session: req.session })

            })

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

exports.chooseHandlerForEditForm = (req, res) => {
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

exports.handleEditPhotosForm = async (req, res) => {
    if (!req.session.logged)
        return res.redirect('/login')

    if (req.params.id != req.session.userId)
        return res.redirect(`/account/${req.session.userId}`)

    if (typeof req.session.business == 'undefined') {
        return res.redirect(`/account/${req.session.userId}`)
    }

    for (let i = 0; i < req.body.photos.length; i++) {
        await body(`photos[${i}]`).trim().notEmpty().withMessage('A row with photo cannot be empty! Remove a row if you do not wish to add more photos!')
            .isURL().withMessage(`Link to photo number ${i + 1} was not a valid URL!`).run(req)
    }

    const errors = validationResult(req).array()

    await Hotel.findOne({ _id: req.params.id }, (err, result) => {
        if (errors.length !== 0)
            return res.render('accounts/editHotelPhotos.ejs', { errors: errors, user: result, session: req.session })

        if (result != null) {
            result.photos = []

            if (typeof req.body.photos != 'undefined') {
                for (photo of req.body.photos) {
                    if (photo !== '') {
                        result.photos.push(photo)
                    }
                }
            }

            result.save()
            return res.render('accounts/editHotelPhotos.ejs', { messages: [{ msg: 'Successfully edited photos' }], user: result, session: req.session })
        }
        return res.render('accounts/editHotelPhotos.ejs', { errors: [{ msg: 'Something went wrong. Please try again later.' }], user: result, session: req.session })

    }).catch(err => console.log(`CRITICAL ERROR DURING LOADING EDIT HOTEL PHOTOS PAGE:\n${err}`))
}

exports.showEditPhotosForm = async (req, res) => {
    if (!req.session.logged)
        return res.redirect('/login')

    if (req.params.id != req.session.userId)
        return res.redirect(`/account/${req.session.userId}`)

    if (typeof req.session.business == 'undefined') {
        return res.redirect(`/account/${req.session.userId}`)
    }

    await Hotel.findOne({ _id: req.params.id }, (err, result) => {
        if (result != null) {
            return res.render('accounts/editHotelPhotos.ejs', { user: result, session: req.session })
        }
        return res.render('accounts/editHotelPhotos.ejs', { errors: [{ msg: 'Something went wrong' }], session: req.session })
    }).catch(err => console.log(`CRITICAL ERROR DURING LOADING EDIT HOTEL PHOTOS PAGE:\n${err}`))

}
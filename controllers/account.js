var { body, validationResult } = require('express-validator')
var bcrypt = require('bcrypt')
var User = require('../models/user')

async function emailUnavailable(email, req) {
    var emailIsUnavailable;
    await User.findOne({ email: req.body.email }, (err, result) => {
        if (result && result._id !== req.session.userId)
            emailIsUnavailable = true;
    })
    return emailIsUnavailable
}

exports.showOwnAccount = async (req, res) => {
    if (req.session.logged) {
        var user
        await User.findOne({ _id: req.session.userId }, (err, result) => user = result)
        if (user == null) {
            //It cannot be null but I will leave it in case I'm wrong
            console.log('It cannot be null u said?')
        }
        user = user.toObject()
        user.joined = user.joined.toISOString().substr(0, 10)
        return res.render('account.ejs', { user: user, session: req.session })
    }
    return res.redirect('/login')
}

exports.showSpecificAccount = async (req, res) => {
    var id = req.params.id
    var user;
    await User.findOne({ _id: id }, (err, result) => { user = result })
    if (user == null)
        return res.render('account.ejs', { errors: [{ msg: 'Account ID is invalid!' }], user: {}, session: req.session })
    user = user.toObject()
    user.joined = user.joined.toISOString().substr(0, 10)
    return res.render('account.ejs', { user: user, session: req.session })
}

exports.showEditForm = async (req, res) => {
    if (!req.session.logged)
        return res.redirect('/login')

    if (req.params.id != req.session.userId)
        return res.redirect("/account")

    var user
    await User.findOne({ _id: req.session.userId }, (err, result) => { user = result })
    if (user == null) {
        //It cannot be null but I will leave it in case I'm wrong
        console.log('It cannot be null u said?')
    }
    return res.render('editAccount.ejs', { user: user, session: req.session })
}

exports.handleEditForm = [

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
        .escape(),

    async (req, res) => {

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

            if (await emailUnavailable(email, req)) {
                user.save()
                return res.render('editAccount.ejs', {
                    user: user,
                    messages: [{ msg: 'Some changes saved successfully.' }],
                    errors: [{ msg: 'E-mail already taken!' }],
                    session: req.session
                })
            }

            user.email = email
            user.save()
            return res.render('editAccount.ejs', { user: user, messages: [{ msg: 'Changes saved successfully.' }], session: req.session })

        } else {
            return res.render('editAccount.ejs', { user: user, errors: errors, session: req.session })
        }
    }
]

exports.showEditPasswordForm = async (req, res) => {
    if (!req.session.logged)
        return res.redirect('/login')

    if (req.params.id != req.session.userId)
        return res.redirect("/account")

    var user
    await User.findOne({ _id: req.session.userId }, (err, result) => { user = result })
    if (user == null) {
        //It cannot be null but I will leave it in case I'm wrong
        console.log('It cannot be null u said?')
    }
    return res.render('editAccountPassword.ejs', { userId: user._id, session: req.session })
}

exports.handleEditPasswordForm = [

    body('password').trim()
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*#?]{0,}/).withMessage('Password must contain at least one small letter, one big letter and one digit.')
        .isLength({ min: 5, max: 30 }).withMessage('Password must be between 5 and 30 characters long.')
        .escape(),

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

        var user
        await User.findOne({ _id: req.session.userId }, (err, result) => { user = result })
        if (user == null) {
            //It cannot be null but I will leave it in case I'm wrong
            console.log('It cannot be null u said?')
        }

        if (errors.length === 0) {
            if (!bcrypt.compareSync(oldPassword, user.password))
                return res.render('editAccountPassword.ejs', { userId: user._id, errors: [{msg: 'Old password is incorrect!'}], session: req.session })
            user.password = bcrypt.hashSync(newPassword, bcrypt.genSaltSync(10))
            user.save()
            return res.render('editAccountPassword.ejs', { userId: user._id, messages: [{ msg: 'Password changed successfully.' }], session: req.session })
        } else {
            return res.render('editAccountPassword.ejs', { userId: user._id, errors: errors, session: req.session })
        }
    }

]
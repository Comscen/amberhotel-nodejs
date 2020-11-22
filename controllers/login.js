const bcrypt = require('bcrypt')
var User = require('../models/user')
var Hotel = require('../models/hotel')

exports.showLoginForm = (req, res) => {
    if (req.session.logged) {
        return res.render('index.ejs', { messages: [{msg: 'You are already signed in!'}], session: req.session })
    }
    return res.render('authorization/login.ejs', { session: req.session })
}

exports.handleLoginForm = async (req, res) => {

    if (req.session.logged) {
        return res.render('index.ejs', { messages: [{msg: 'You are already signed in!'}], session: req.session })
    }

    const checkPasswordAndProceed = account => {
        if (bcrypt.compareSync(req.body.password, account.password)) {
            req.session.logged = true
            req.session.userId = account._id
            if (typeof account.admin == 'undefined') //Only private accounts can be admin accounts
                req.session.business = true
            return res.render('index.ejs', { messages: [{ msg: 'You are now signed in!' }], session: req.session })
        }
        return res.render('authorization/login.ejs', { errors: [{ msg: 'Incorrect e-mail or password!' }], session: req.session })
    }

    var queries = [
        await User.findOne({ email: req.body.email }).select('_id password admin').lean().exec(),
        await Hotel.findOne({ email: req.body.email }).select('_id password').lean().exec(),
    ]

    await Promise.all(queries).then(results => {
        if (results[0] !== null) {
            checkPasswordAndProceed(results[0])
        } else if (results[1] !== null) {
            checkPasswordAndProceed(results[1])
        } else {
            return res.render('authorization/login.ejs', { errors: [{ msg: 'Incorrect e-mail or password!' }], session: req.session })
        }
    }).catch(err => console.log(`CRITICAL ERROR DURING SIGN UP:\n${err}`))
}
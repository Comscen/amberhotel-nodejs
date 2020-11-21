const bcrypt = require('bcrypt')
var User = require('../models/user')
var Hotel = require('../models/hotel')

exports.showLoginForm = (req, res) => {
    res.render('login.ejs', { session: req.session })
}

exports.handleLoginForm = async (req, res) => {
    var queries = [
        await User.findOne({email : req.body.email}).select('_id password').lean().exec(),
        await Hotel.findOne({email: req.body.email}).select('_id password').lean().exec(),
    ]
    
    await Promise.all(queries).then(results => {
        if (results[0] !== null) {
            if (bcrypt.compareSync(req.body.password, results[0].password)) {
                req.session.logged = true
                req.session.userId = results[0]._id
                return res.render('index.ejs', { messages: [{ msg: 'You are now signed in!' }], session: req.session })
            }
        } else if (results[1] !== null) {
            if (bcrypt.compareSync(req.body.password, results[1].password)) {
                req.session.logged = true
                req.session.business = true
                req.session.userId = results[1]._id
                return res.render('index.ejs', { messages: [{ msg: 'You are now signed in as a business account!' }], session: req.session })
            }
        } else {
            return res.render('login.ejs', { errors: [{ msg: 'Incorrect e-mail or password!' }], session: req.session })
        }
    }).catch(err => console.log(`CRITICAL ERROR DURING SIGN UP:\n${err}`))
}
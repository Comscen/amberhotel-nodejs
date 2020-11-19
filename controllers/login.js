const bcrypt = require('bcrypt')
var User = require('../models/user')

exports.showLoginForm = (req, res) => {
    res.render('login.ejs', {session: req.session})
}

exports.handleLoginForm = async (req, res) => {
    await User.findOne({email: req.body.email}, (err, result) => {
        if (result != null) {
            if (bcrypt.compareSync(req.body.password, result.password)) {
                req.session.logged = true;
                req.session.userId = result._id;
                return res.render('index.ejs', {messages: [{msg: 'You are now signed in!'}], session: req.session})
            }
        } 
        return res.render('login.ejs', {errors: [{msg: 'Incorrect e-mail or password!'}], session: req.session})
    })
}
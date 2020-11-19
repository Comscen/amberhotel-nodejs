/*jshint globalstrict: true, devel: true, node: true*/
'use strict';

var express = require('express')
var app = express()
var path = require('path')
var bodyParser = require('body-parser')
var favicon = require('serve-favicon')
var database = require('./dbconnection')

const session = require('express-session')

database.connect()

app.set('view engine', 'ejs')

app.use(favicon(__dirname + '/public/favicon.ico'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))
app.use(session({secret: 'amber-secret', resave: false, saveUninitialized: false}))

// Routing
var indexRoutes = require('./routes/index')
var loginRoutes = require('./routes/login')
var registerRoutes = require('./routes/register')
var accountRoutes = require('./routes/account')

app.use('/', indexRoutes)
app.use('/login', loginRoutes)
app.use('/register', registerRoutes)
app.use('/account', accountRoutes)

app.get('/about', (req, res) => res.render('about.ejs', {session: req.session}))

app.get('/license', (req, res) => res.render('license.ejs', {session: req.session}))

app.get('/logout', (req, res) => {
    delete req.session.logged
    delete req.session.userId
    return res.render('index.ejs', {session: req.session})
})

app.listen(process.env.PORT || 3000, function () {
    console.log(`Application started on PORT: ${process.env.PORT || 3000}`);
});

process.on('SIGINT', function () {
    console.log("Application shutting down...");
    database.close()
    process.exit();
});
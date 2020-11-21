/*jshint globalstrict: true, devel: true, node: true*/
'use strict';

var express = require('express')
var app = express()
var path = require('path')
var bodyParser = require('body-parser')
var favicon = require('serve-favicon')
var mongodb = require('./mongodb')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)

app.use(session({
    secret: 'amber-secret', 
    resave: false, 
    saveUninitialized: false,
    cookie: { maxAge: 60 * 60 * 1000 },
    store: new MongoStore({
        mongooseConnection: mongodb.getConnection(),
        clear_interval: 3600
    })
}))

app.use(favicon(__dirname + '/public/favicon.ico'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))
app.set('view engine', 'ejs')
mongodb.connect()

/* 
    Main routing
*/
var indexRoutes = require('./routes/index')
var loginRoutes = require('./routes/login')
var registerRoutes = require('./routes/register')
var accountRoutes = require('./routes/account')

app.use('/', indexRoutes)
app.use('/login', loginRoutes)
app.use('/register', registerRoutes)
app.use('/account', accountRoutes)

/* 
    Routing for pages that don't need their own controller. About and license pages
    are simple and nearly static and logout only deletes session variables.
*/
app.get('/about', (req, res) => res.render('about.ejs', {session: req.session}))
app.get('/license', (req, res) => res.render('license.ejs', {session: req.session}))
app.get('/logout', (req, res) => {
    delete req.session.logged
    delete req.session.userId
    if (req.session.business) delete req.session.business
    return res.render('index.ejs', {session: req.session})
})

/* 
    This method call defines which port this application should use.
    To change said port for development purposes, use environment variable 
    with proper name and leave 3000 as default.
*/
app.listen(process.env.PORT || 3000, function () {
    console.log(`Application started on PORT: ${process.env.PORT || 3000}`);
});

/* 
    This method call defines what the app should do when SIGINT interrupt
    is sent. It's configured to close the database connection and kill the server.
*/
process.on('SIGINT', function () {
    console.log("Application shutting down...");
    mongodb.close()
    process.exit();
});
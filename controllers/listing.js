var Hotel = require('../models/hotel')

exports.showHotels = async (req, res) => {
    await Hotel.find().lean().exec().then(results => {
        return res.render('listing/hotels.ejs', {hotels: results, session: req.session})
    }).catch(err => console.log(`CRITICAL ERROR DURING LISTING HOTELS:\n${err}`))
}
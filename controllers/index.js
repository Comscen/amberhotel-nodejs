const Hotel = require("../models/hotel")

exports.showIndex = async (req, res) => {
    await Hotel.find({}, (err, result) => {
        if (result.length > 0) {
            let hotels = []
            let indexes = []
            let condition = result.length < 4 ? result.length : 4
            for (let i = 0; i < condition; i++){
                do {
                    var tmp = Math.floor(Math.random() * (result.length))
                } while (indexes.includes(tmp, 0));
                indexes.push(tmp)
                hotels.push(result[indexes[i]])
            }
            return res.render('index.ejs', { session: req.session, hotels: hotels })
        }
        return res.render('index.ejs', { session: req.session })
    }).catch(err => console.log(`Error while showing index: ${err}`))
}
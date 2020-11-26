const Hotel = require("../models/hotel")

exports.showIndex = async (req, res) => {
    await Hotel.find({} , (err, result) =>{
        if(result != null){
            hotels = []
            let first = Math.floor(Math.random() * (result.length))
            let second;
            hotels.push(result[first])
            do{
                second = Math.floor(Math.random() * (result.length))
            }while(first == second);
            hotels.push(result[second])
            return res.render('index.ejs', {session: req.session, hotels: hotels})
        }
        return res.render('index.ejs', {session: req.session})
    }).catch(err => console.log(`Error while showing index: ${err}`))
}
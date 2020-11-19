exports.showIndex = (req, res) => {
    res.render('index.ejs', {session: req.session})
}
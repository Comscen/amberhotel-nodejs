
exports.showDashboard = async (req, res) => {

    return res.render('index.ejs', {session: req.session} )
}
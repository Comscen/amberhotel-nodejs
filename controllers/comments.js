var User = require('../models/user')
var Hotel = require('../models/hotel')
var Comment = require('../models/comment')

exports.showForUserCommentForm = async (req, res) => {

    if (!req.session.logged)
        return res.redirect('/login')

    if (req.session.business)
        return res.redirect('/dashboard/history')

    await Hotel.findOne({ _id: req.params.id }).lean().exec().then(async hotel => {
        if (hotel == null)
            return res.render('comments/addComment.ejs', { hotel: undefined, session: req.session, errors: [{ msg: 'Invalid hotel ID!' }] })

        await Comment.findOne({ hotel: hotel._id, user: req.session.userId, byUser: true }).lean().exec().then(comment => {
            if (comment != null)
                return res.render('comments/addComment.ejs', { hotel: hotel, session: req.session, errors: [{ msg: 'You have already added a comment about this hotel!' }] })

            return res.render('comments/addComment.ejs', { session: req.session, hotel: hotel })

        }).catch(err => console.log(`CRITICAL GET COMMENT ERROR WHILE SHOWING NEW COMMENT FORM:\n${err}`))

    }).catch(err => console.log(`CRITICAL GET HOTEL ERROR WHILE SHOWING NEW COMMENT FORM:\n${err}`))

}

exports.showForHotelCommentForm = async (req, res) => {

    if (!req.session.logged)
        return res.redirect('/login')

    if (!req.session.business)
        return res.redirect('/dashboard/history')

    await User.findOne({ _id: req.params.id }).lean().exec().then(async user => {
        if (user == null)
            return res.render('comments/addCommentAboutUser.ejs', { user: undefined, session: req.session, errors: [{ msg: 'Invalid user ID!' }] })

        await Comment.findOne({ hotel: req.session.userId, user: user._id, byUser: false }).lean().exec().then(comment => {
            if (comment != null)
                return res.render('comments/addCommentAboutUser.ejs', { user: user, session: req.session, errors: [{ msg: 'You have already added a comment about this user!' }] })

            return res.render('comments/addCommentAboutUser.ejs', { session: req.session, user: user })

        }).catch(err => console.log(`CRITICAL GET COMMENT ERROR WHILE SHOWING NEW COMMENT FORM:\n${err}`))

    }).catch(err => console.log(`CRITICAL GET HOTEL ERROR WHILE SHOWING NEW COMMENT FORM:\n${err}`))

}

exports.handleForUserCommentForm = async (req, res) => {

    if (!req.session.logged)
        return res.redirect('/login')

    if (req.session.business)
        return res.redirect('/dashboard/history')

    await Hotel.findOne({ _id: req.params.id }).exec().then(async hotel => {
        if (hotel == null)
            return res.render('comments/addComment.ejs', { hotel: undefined, session: req.session, errors: [{ msg: 'Invalid hotel ID!' }] })

        await Comment.findOne({ hotel: hotel._id, user: req.session.userId, byUser: true }).lean().exec().then(comment => {
            if (comment != null)
                return res.render('comments/addComment.ejs', { hotel: hotel, session: req.session, errors: [{ msg: 'You have already added a comment about this hotel!' }] })

            new Comment({
                title: req.body.title,
                content: req.body.content,
                rating: req.body.rating,
                byUser: true,
                user: req.session.userId,
                hotel: hotel._id
            }).save(async err => {
                if (err)
                    return res.render('comments/addComment.ejs', { hotel: hotel, session: req.session, errors: [{ msg: 'Something went wrong. Please try again later.' }] })

                await Comment.find({ hotel: req.params.id }).select('rating').lean().exec().then(comments => {
                    let sum = 0;
                    for (comment of comments) {
                        sum += comment.rating
                    }
                    hotel.rating = parseFloat((sum / comments.length).toFixed(2))
                    hotel.save()
                })

                return res.render('comments/addComment.ejs', { hotel: hotel, session: req.session, messages: [{ msg: 'Successfully added new comment.' }] })

            })

        }).catch(err => console.log(`CRITICAL GET COMMENT ERROR WHILE ADDING NEW COMMENT:\n${err}`))

    }).catch(err => console.log(`CRITICAL GET HOTEL ERROR WHILE ADDING NEW COMMENT:\n${err}`))

}

exports.handleForHotelCommentForm = async (req, res) => {

    if (!req.session.logged)
        return res.redirect('/login')

    if (!req.session.business)
        return res.redirect('/dashboard/history')

    await User.findOne({ _id: req.params.id }).exec().then(async user => {
        if (user == null)
            return res.render('comments/addCommentAboutUser.ejs', { user: undefined, session: req.session, errors: [{ msg: 'Invalid user ID!' }] })

        await Comment.findOne({ hotel: req.session.userId, user: user._id, byUser: false }).lean().exec().then(comment => {
            if (comment != null)
                return res.render('comments/addCommentAboutUser.ejs', { user: user, session: req.session, errors: [{ msg: 'You have already added a comment about this user!' }] })

            new Comment({
                title: req.body.title,
                content: req.body.content,
                rating: 0,
                byUser: false,
                user: user._id,
                hotel: req.session.userId
            }).save(async err => {
                if (err)
                    return res.render('comments/addCommentAboutUser.ejs', { user: user, session: req.session, errors: [{ msg: 'Something went wrong. Please try again later.' }] })

                return res.render('comments/addCommentAboutUser.ejs', { user: user, session: req.session, messages: [{ msg: 'Successfully added new comment.' }] })

            })

        }).catch(err => console.log(`CRITICAL GET COMMENT ERROR WHILE ADDING NEW COMMENT:\n${err}`))

    }).catch(err => console.log(`CRITICAL GET HOTEL ERROR WHILE ADDING NEW COMMENT:\n${err}`))

}
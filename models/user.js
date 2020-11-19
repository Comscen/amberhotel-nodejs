var mongoose = require('mongoose')
var { nanoid } = require('nanoid')

const UserSchema = new mongoose.Schema({
    _id: { type: String, default: () => nanoid(10) },
    email: { type: String, unique: true, required: true, dropDups: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    surname: { type: String, required: true },
    photo: String,
    joined: Date,
    location: String,
    admin: { type: Boolean, default: false }
})

const User = mongoose.model('User', UserSchema)

module.exports = User
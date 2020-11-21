const mongoose = require('mongoose')

exports.connect = () => {
    mongoose.set('useCreateIndex', true)
    mongoose.connect(`mongodb://localhost:27017/amberhotel`, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    mongoose.connection.on('error', console.error.bind(console, 'Database connection error:'))
    mongoose.connection.once('open', () => console.log('Database connection successful'))
}

exports.getConnection = () => {
    return mongoose.connection
}

exports.close = () => {
    mongoose.connection.close()
}
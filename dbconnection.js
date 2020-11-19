const mongoose = require('mongoose')

exports.connect = () => {
    mongoose.set('useCreateIndex', true)
    mongoose.connect(`mongodb+srv://${process.env.AHDB_LOGIN}:${process.env.AHDB_PASSWORD}@${process.env.AHDB_HOST}/${process.env.AHDB_DATABASE}?retryWrites=true&w=majority`, {
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
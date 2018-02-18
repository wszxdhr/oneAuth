let mongoose = require('mongoose')
let mongoConfig = require('../../config')

let mongoAuthUrl = `mongodb://${mongoConfig.sqlUsername}:${mongoConfig.sqlPassword}@${mongoConfig.sqlHost}:${mongoConfig.sqlPort}/${mongoConfig.sqlDatabase}`

mongoose.connect(mongoAuthUrl, {
  // useMongoClient: true
})
mongoose.Promise = global.Promise;

mongoose.connection.on('error', function (err) {
  console.log('Mongo connection error: ', err)
})

mongoose.connection.on('disconnected', function () {
  console.log('Mongo connection disconnected')
})

module.exports = mongoose.connection


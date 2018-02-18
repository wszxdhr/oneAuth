let mongoose = require('../mongodb')

let Model = mongoose.model('user', {
  username: String,
  password: String,
  token: Object,
  expiredAt: Number,
  createdAt: Number,
  updatedAt: Number
})

module.exports = Model


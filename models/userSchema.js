const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserSchema = new Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  member_status: { type: String, required: true },
  date_joined: { type: Date, default: Date.now, required: true },
})

module.exports = mongoose.model('User', UserSchema)

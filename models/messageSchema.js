const mongoose = require('mongoose')
const Schema = mongoose.Schema

const messageSchema = new Schema({
  title: { type: String, required: true },
  text: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date_posted: { type: Date, default: Date.now, required: true },
})

module.exports = mongoose.model('Message', messageSchema)

const mongoose = require('mongoose')
const messageSchema = new mongoose.Schema({

  username: {
    type: String,
    required: true
  }
  ,
  text: {
    type: String,
    required: true,
  },
  roomname: {
    type: String,
    default: "Lobby"
  },
  avaurl: {
    type: String,
    default: "https://robohash.org/azx"
  }
},{timestamps: true})


const Message = mongoose.model('Message', messageSchema)


module.exports = Message
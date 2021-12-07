const mongoose = require('mongoose')
const pictureSchema = new mongoose.Schema({

  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  }
  ,
  picture: {
    type: Buffer
  }
},{timestamps: true})


const Picture = mongoose.model('Picture', pictureSchema)


module.exports = Picture
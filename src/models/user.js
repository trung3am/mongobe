const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Picture = require('./picture')

const nameRegex = /^[a-zA-Z0-9\-]+$/

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
    minlength: 3,
    validate(value){
      if (!value.match(nameRegex)) {
        throw new console.error('name is not valid');
      }
    }
  },
  password: {
    type: String,
    require: true,
    minLength: 6,
    
  },
  email: {
    type: String,
    unique: true,
    require: true,
    validate(value){
      if (!validator.isEmail(value)) {
        throw new Error('Email is not valid')
      }
    }
  },
  pictures: [{
    picture:{
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      }
    }
  }],

  
  tokens: [{
    token: {
      type: String,
      required: true,
      createdAt: {type: Date, expires: "2M", default: Date.now}
    }
  }],
  avatar: {
    type: Buffer
  }

},{timestamps: true})



userSchema.pre('save', async function (next) {
  const user = this
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8)
  }
  next()
})

userSchema.pre('remove', async function (next) {
  const user = this
  await Picture.deleteMany({owner: user._id})
  next()
})

userSchema.statics.findByCredentials = async (email, password) =>{
  const user = await User.findOne({email})
  if (!user) {
    throw new Error('Unable to login')
  }

  const isMatch = await bcrypt.compare(password, user.password)
  
  if (!isMatch) {
    throw new Error('Unable to login')
  }

  return user
}



userSchema.methods.generateAuthToken = async function () {
  const user = this

  try {
    const token = await jwt.sign({_id: user.id.toString()}, process.env.JWT_SECRET)
    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
  } catch (e) {
    throw new Error("Unable to login")
  }
}



userSchema.methods.toJSON = function () {
  const user = this
  const userObject = user.toObject()
  delete userObject.password
  delete userObject.tokens
  delete userObject.avatar
  return userObject
}

const User = mongoose.model('User', userSchema)


module.exports = User
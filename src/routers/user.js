const express = require('express')
const auth = require('../middleware/auth')
const sharp = require('sharp')
const User = require('../models/user')
const router = new express.Router()
const multer = require('multer')
const storage = multer.memoryStorage()







router.get('/users/me',auth ,async(req,res)=>{
  res.send(req.user)


})



router.patch('/users/me',auth, async (req,res)=>{
  const updates = Object.keys(req.body)
  const allowedUpdates = ['name', 'email', 'password']
  const isValidOperation = updates.every((update)=>allowedUpdates.includes(update))
  if (!isValidOperation) {
    return res.status(400).send({error: "Invalid update"})
  }


  try {

    updates.forEach((update)=>req.user[update] = req.body[update])
    await req.user.save()
    
    res.send(req.user)
  } catch (e) {
    res.status(400).send(e)
  }
})

router.post('/users', async (req,res)=>{  
  const user = new User(req.body)
  user.avaurl = "https://robohash.org/" + req.body.name
  try {
    await user.save()
    const token = await user.generateAuthToken()
    res.status(201).send({user,token})
  } catch (error) {
    res.status(400).send(error)
  }
  
})

router.post('/users/login', async (req,res)=>{
  try {
    
    const user = await User.findByCredentials(req.body.email,req.body.password)
    const token = await user.generateAuthToken()
    
    res.send({user ,token})
  } catch (e) {
    res.status(400).send()
  }
})

router.post('/users/logout', auth, async (req,res)=>{
  try {
    req.user.tokens = req.user.tokens.filter((token)=>{
      return token.token !== req.token
    })
    await req.user.save()
    res.send()
  } catch (e) {
    res.status(500).send(e)
  }
})

router.post('/users/logoutALL', auth, async(req,res)=>{
  try {
    req.user.tokens = []
    await req.user.save()
    res.send()
  } catch (e) {
    res.status(500).send(e)
  }
})

router.delete('/users/me',auth, async (req,res)=>{
  try {

    await req.user.remove()
    res.send('deleted!: ' + req.user)
  } catch (e) {
    res.status(400).send(e)
  }
})

const upload = multer({
  dest: 'avatars',
  limits: {
    fileSize:10000000
  },
  fileFilter(req,file,cb) {
    if (!file.originalname.match(/\.(jpg|png|jpeg)$/)) {
      return cb (new Error('Please upload png/jpg/jpeg file'))  
    }
    cb(undefined,true)

  }, storage: storage
})


router.post('/users/me/avatar', auth, upload.single('avatar'), async (req,res)=>{
  const buffer = await sharp(req.file.buffer).resize({width:150, height: 150}).png().toBuffer()
  req.user.avatar = buffer
  req.user.avaurl = "http://localhost:3005/users/" + String(req.user._id) + "/avatar"
  await req.user.save()
  res.send()
},(error,req,res,next)=>{
  res.status(400).send({error: error.message})
})

router.delete('/users/me/avatar',auth, async (req,res)=>{
  req.user.avatar = undefined
  req.user.avaurl = "https://robohash.org/" + String(req.user._id)
  await req.user.save()
  res.send()
},(error,req,res)=>{
  res.status(400).send({error: error.message})
})

router.get('/users/:id/avatar', async (req,res)=>{
  try {
    const user = await User.findById(req.params.id)
    if (!user || !user.avatar) {
      throw new Error()
    }

    res.set('Content-Type', 'image/jpg')
    res.send(user.avatar)
  } catch (e) {
    res.status(404).send()  
  }
})

router.get('/users/picture/all', auth, async (req,res)=>{
  res.send(req.user.pictures) 
})

module.exports = router
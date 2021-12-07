const express = require('express')
const sharp = require('sharp')
const Picture = require('../models/picture')
const router = new express.Router()
const multer = require('multer')
const storage = multer.memoryStorage()
const auth = require('../middleware/auth')
const mongoose = require('mongoose')

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



router.post('/users/picture/create', auth ,upload.single('picture'), async (req,res)=>{
  if (req.user.pictures.length >= 10) {
    res.status(400).send({error: "photo storage reached limit"})
    return
  }

  const buffer = await sharp(req.file.buffer).resize({fit: sharp.fit.contain, height: 300}).png().toBuffer()
  const picture = new Picture({

    owner: req.user._id,
    buffer: buffer
  })
  await picture.save()
  var addPicture = {_id: picture._id ,name: 'photo'}
  if (req.body.name) {
    addPicture = {_id: picture._id,  name: req.body.name}
  }
  
  req.user.pictures = req.user.pictures.concat(addPicture)
  
  await req.user.save()

  res.status(201).send()
},(error,req,res,next)=>{
  res.status(400).send({error: error.message})
})






router.patch('/users/picture/update', auth, upload.single('picture'), async (req,res)=>{
  var pic = null

  req.user.pictures.forEach(e => {
    if (e._id.equals(mongoose.Types.ObjectId(req.body._id))) {

      if (req.body.name) {
        e.name = req.body.name
        
      }
      pic = e    
    }
    
  });
  
  if (pic === null) {
    res.status(400).send({error: "cannot find picture to update"})
    return
  }

 
  await req.user.save()

  const buffer = await sharp(req.file.buffer).resize({fit: sharp.fit.contain, height: 300}).png().toBuffer()
  var picture = await Picture.findById(req.body._id)
  
  picture.buffer = buffer
    await picture.save()



  res.status(200).send()

},(error,req,res)=>{
  res.status(400).send({error: error.message})
})


router.delete('/users/picture/delete',auth , async (req,res)=>{
  const count = req.user.pictures.length
  
  req.user.pictures = req.user.pictures.filter((picture)=>{
  
    if (picture._id.equals(mongoose.Types.ObjectId(req.body._id)) === false) {
      return picture
    } 

  })
  if (count === req.user.pictures.length) {
    res.status(400).send({error: "cannot found photo to delete"})
    return
  }
  await req.user.save()
  const picture = await Picture.findById(req.body._id)
  await picture.remove()
  res.send()
},(error,req,res)=>{
  res.status(400).send({error: error.message})
})


router.delete('/users/picture/delete/all', auth, async (req,res)=>{
  try {
    await Picture.deleteMany({owner: req.user._id})
  
    req.user.pictures = []
    await req.user.save()
    res.send()
  } catch (e) {
    res.status(400).send(e)
  }

},(error,req,res)=>{
  res.status(400).send({error: error.message})
})


router.get('/:id', async (req,res)=>{
  try {
    const picture = await Picture.findById(req.params.id)
    if (!picture || !picture.buffer) {
      throw new Error()
    }

    res.set('Content-Type', 'image/jpg')
    res.send(picture.buffer)
  } catch (e) {
    res.status(404).send()  
  }
})

module.exports = router
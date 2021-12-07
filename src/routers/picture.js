const express = require('express')
const sharp = require('sharp')
const Picture = require('../models/picture')
const router = new express.Router()
const multer = require('multer')
const storage = multer.memoryStorage()
const auth = require('../middleware/auth')

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
    picture: buffer
  })
  await picture.save()
  const addPicture = {picture: {_id: picture._id}}
  req.user.pictures = req.user.pictures.concat(addPicture)
  
  req.user.pictures.forEach(e => {
    console.log(e)
  });
  await req.user.save()

  res.status(201).send()
},(error,req,res,next)=>{
  res.status(400).send({error: error.message})
})






router.patch('/users/picture/update', auth, upload.single('picture'), async (req,res)=>{
  const pic = null

  req.user.pictures.forEach(e => {
    if (e._id === req.body._id) {
      const pic = e
      
    }
  });
  if (pic === null) {
    res.status(400).send({error: "cannot find picture to update"})
    return
  }


  const buffer = await sharp(req.file.buffer).resize({fit: sharp.fit.contain, height: 300}).png().toBuffer()
  const picture = Picture.findById(req.body._id)
  picture.picture = buffer
  await picture.save()
  res.status(200).send()

},(error,req,res)=>{
  res.status(400).send({error: error.message})
})


router.delete('/users/picture/delete',auth , async (req,res)=>{
  const count = req.user.pictures.length
  req.user.pictures = req.user.pictures.filter((picture)=>{
    return picture._id !== req.body._id
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



router.get('/:id', async (req,res)=>{
  try {
    const picture = await Picture.findById(req.params.id)
    if (!picture || !picture.picture) {
      throw new Error()
    }

    res.set('Content-Type', 'image/jpg')
    res.send(picture.picture)
  } catch (e) {
    res.status(404).send()  
  }
})

module.exports = router
const express = require('express')
const router = new express.Router()
const Message = require('../models/message')

router.post('/messages/send' , async(req,res)=>{

    if (!req.body || !req.body.username || !req.body.text) {
        res.status(400).send()
    }
    
    const message = new Message({
        username: req.body.username,
        text: req.body.text,
        avaurl: req.body.avaurl,
        roomname: req.body.roomname
    })
    try {
        await message.save()
        res.status(201).send()
        return
    } catch (e) {
        res.status(500).send(e)
        return
    }


})

router.post('/messages', async(req,res)=>{
    var messages = []
    try {
        messages = await Message.find({roomname: req.body.roomname}).sort({createdAt: -1}).limit(30)
        res.status(200).send(messages)
    } catch (e) {
        res.status(500).send(e)
    }

})

module.exports = router
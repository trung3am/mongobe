var cors = require('cors')
var express = require('express')
require('./db/mongoose')
var userRouter = require('./routers/user')
var pictureRouter = require('./routers/picture')

var app = express()
app.use(cors())

var port = process.env.PORT || 3003
app.use(express.json())

app.use(userRouter)
app.use(pictureRouter)

app.listen(port, ()=>{
  console.log('Server is up on port ' + port)
})

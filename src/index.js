const express = require('express')
require('./db/mongoose')

const app = express()
const port = process.env.PORT || 3003
const userRouter = require('./routers/user')

const pictureRouter = require('./routers/picture')

app.use(express.json())
app.use(userRouter)
app.use(pictureRouter)

app.listen(port, ()=>{
  console.log('Server is up on port ' + port)
})

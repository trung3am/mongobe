const mongoose = require('mongoose')



mongoose.connect(process.env.MONGODB_URL,{
  useNewUrlParser: true
},(error, client)=>{
  if (error) {
    return console.log('cannot connect to server')
  }
  console.log("OK")
})





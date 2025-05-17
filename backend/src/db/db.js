const mongoose = require('mongoose')
 function connect(params) {
    mongoose.connect('mongodb://localhost:27017/votingApp')
    .then(()=>{
        console.log('Connected to Database');
    })
    .catch((err)=>{
        console.log(err)
    })
}
module.exports=connect
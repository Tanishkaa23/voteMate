const app = require('./src/app')
const connect = require('./src/db/db.js')
connect()
app.listen(3000,()=>{
    console.log('Server running on port 3000')
})

const express = require('express');
const app = express();
const cookieParser = require('cookie-parser')
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:5173', 
    'https://myvotemate.vercel.app'
  ],
  credentials: true
}));

app.use(cookieParser())
app.set('view engine', 'ejs')
app.use(express.json())
app.use(express.urlencoded({extended:true}))
const userRoutes = require('./routes/user.routes')
const pollRoutes = require('./routes/poll.routes')
app.use('/user',userRoutes)
app.use('/api',pollRoutes)
module.exports= app;

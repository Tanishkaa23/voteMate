
const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const cors = require('cors');

const userRoutes = require('./routes/user.routes'); 
const pollRoutes = require('./routes/poll.routes');   

const allowedOrigins = [
  'http://localhost:5173',       
  'https://myvotemate.vercel.app' 
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy does not allow access from origin: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], 
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'Access-Control-Allow-Credentials', 'Access-Control-Allow-Origin'],
  optionsSuccessStatus: 204,
  preflightContinue: false  
}));




app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.get('/', (req, res) => {
  res.send('Voting App Backend is Up and Running!');
});

app.use('/user', userRoutes);
app.use('/api', pollRoutes);

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack || err.message || err);
  res.status(err.status || 500).json({
    error: err.message || 'Something went wrong on the server!'
  });
});

module.exports = app;
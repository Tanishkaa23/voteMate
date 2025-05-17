

require('dotenv').config(); 

const app = require('./src/app'); 
const connectDB = require('./src/db/db.js'); 


const PORT = process.env.PORT || 3000; 

const startServer = async () => {
  try {
    await connectDB(); 
    
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Backend server is running on port ${PORT}`);
      console.log(`Locally accessible at http://localhost:${PORT} (if running locally)`);
    });
  } catch (error) {
    console.error('Failed to connect to the database or start the server:', error);
    process.exit(1); 
  }
};

startServer();
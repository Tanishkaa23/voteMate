const jwt = require('jsonwebtoken');
const User = require('../models/user.model'); // Assuming your user model is here

module.exports.authMiddleware = async (req, res, next) => { // Make it async
    // 1. Get token from cookies (ensure cookie name matches what's set during login/register)
    const token = req.cookies?.token; // <<--- CORRECTED COOKIE NAME to 'token'

    if (!token) {
        console.log("No token found, authorization denied.");
        // 2. If no token, send 401 Unauthorized response
        return res.status(401).json({ error: 'Not authorized, no token provided' });
    }

    try {
        // 3. Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'vote-sec'); // Use env var for secret

        // 4. Get user from the token's ID and attach to req object
        // This ensures the user exists and req.user has fresh data
        // Select '-password' to exclude the password field from being attached to req.user
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            console.log("Token valid, but user not found in DB.");
            return res.status(401).json({ error: 'Not authorized, user not found' });
        }

        req.user = user; // Attach the full user object (without password)
        
        // console.log("Auth Middleware: User authenticated - ", req.user.username, req.user.id); // For debugging
        next(); // Proceed to the next middleware or route handler

    } catch (error) {
        console.error('Token verification failed or other auth error:', error.message);
        // 5. If token is not valid (expired, tampered, etc.), send 401 Unauthorized
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Not authorized, invalid token' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Not authorized, token expired' });
        }
        // For other errors during the process
        return res.status(500).json({ error: 'Server error during authentication' });
    }
};
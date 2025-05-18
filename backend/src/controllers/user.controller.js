// backend/controllers/user.controller.js
const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// USER REGISTRATION
module.exports.userRegisterController = async (req, res) => {
  const { username, email, password, role } = req.body;

  // Basic validation
  if (!username || !email || !password) {
    return res.status(400).json({ error: "Username, email, and password are required." });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters long." });
  }
  if (!/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ error: "Invalid email format." });
  }

  try {
    const existingUserByEmail = await userModel.findOne({ email });
    if (existingUserByEmail) {
      return res.status(400).json({ error: "User with this email already exists." });
    }
    const existingUserByUsername = await userModel.findOne({ username });
    if (existingUserByUsername) {
      return res.status(400).json({ error: "Username is already taken." });
    }
    
    // Password hashing should be handled by a Mongoose pre-save hook in user.model.js
    const user = await userModel.create({ 
        username, 
        email, 
        password,
        role: role || 'user' // Default to 'user' if role is not provided
    });

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'vote-sec', // Use environment variable for JWT_SECRET
      { expiresIn: '1d' }
    );

    // Set a non-HttpOnly cookie so js-cookie can access it on the client
    res.cookie('token', token, { 
      httpOnly: false, // IMPORTANT: Allows client-side JS to read this cookie
      secure: process.env.NODE_ENV === 'production', // Send only over HTTPS in production
      sameSite: 'lax', // Good default for CSRF protection
      path: '/',       // IMPORTANT: Makes cookie available across the entire domain
      maxAge: 24 * 60 * 60 * 1000 // 1 day in milliseconds
    });

    const userResponse = {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
    };
    // Also send the token in the response body for client-side handling if needed
    return res.status(201).json({ message: "User registered successfully", user: userResponse, token: token });

  } catch (error) {
    console.error("Registration Error:", error);
    if (error.code === 11000) { // MongoDB duplicate key error
        if (error.keyPattern && error.keyPattern.email) {
            return res.status(400).json({ error: "User with this email already exists." });
        }
        if (error.keyPattern && error.keyPattern.username) {
            return res.status(400).json({ error: "Username is already taken." });
        }
    }
    return res.status(500).json({ error: "An error occurred during registration." });
  }
};

// USER LOGOUT
module.exports.logoutUserController = async (req, res) => {
  // Clear the cookie. Must match attributes used when setting it (especially path).
  res.clearCookie('token', { 
    // httpOnly: false, // Not strictly needed for clearCookie if other attributes match
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/' // IMPORTANT: Match the path used when setting the cookie
  });
  res.status(200).json({ message: 'Logged out successfully' });
};


// USER LOGIN
module.exports.loginUserController = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials." }); // Generic error
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials." }); // Generic error
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'vote-sec',
      { expiresIn: '1d' }
    );

    // Set a non-HttpOnly cookie
    res.cookie('token', token, {
      httpOnly: false, // IMPORTANT
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',       // IMPORTANT
      maxAge: 24 * 60 * 60 * 1000
    });
    
    const userResponse = {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
    };
    // Also send token in response body
    return res.status(200).json({ message: "Login successful", user: userResponse, token: token });

  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ error: "An error occurred during login." });
  }
};

// GET CURRENT USER (ME) - This is still useful for initial auth check if needed elsewhere or for protected routes
module.exports.getMeController = async (req, res) => {
  // authMiddleware should have populated req.user if a valid token (HttpOnly or not) was sent by browser
  if (req.user) {
    return res.status(200).json({ user: req.user });
  } else {
    return res.status(401).json({ error: 'User not authenticated' });
  }
};
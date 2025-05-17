const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// USER REGISTRATION
module.exports.userRegisterController = async (req, res) => {
  const { username, email, password, role } = req.body;

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
    
    const user = await userModel.create({ 
        username, 
        email, 
        password,
        role: role || 'user'
    });

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'vote-sec',
      { expiresIn: '1d' }
    );

    // Cookie NOT HttpOnly so NavBar.jsx can read it with js-cookie
    res.cookie('token', token, { 
      httpOnly: false, // <<--- SET TO FALSE or remove line for non-HttpOnly
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000
    });

    const userResponse = {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
    };
    return res.status(201).json({ message: "User registered successfully", user: userResponse, token: token }); // Send token in response too

  } catch (error) {
    console.error("Registration Error:", error);
    if (error.code === 11000) {
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
  res.clearCookie('token', { 
    // httpOnly: false, // Match how it was set
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
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
      // Consider generic message for security, but for debugging this is fine:
      return res.status(401).json({ error: "Invalid credentials. User not found." }); 
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'vote-sec',
      { expiresIn: '1d' }
    );

    // Cookie NOT HttpOnly
    res.cookie('token', token, {
      httpOnly: false, // <<--- SET TO FALSE or remove line for non-HttpOnly
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000
    });
    
    const userResponse = {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
    };
    // Send token in response body as well, so Login/Register can set it with js-cookie
    return res.status(200).json({ message: "Login successful", user: userResponse, token: token });

  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ error: "An error occurred during login." });
  }
};

// GET CURRENT USER (ME)
module.exports.getMeController = async (req, res) => {
  if (req.user) {
    return res.status(200).json({ user: req.user });
  } else {
    return res.status(401).json({ error: 'User not authenticated' });
  }
};
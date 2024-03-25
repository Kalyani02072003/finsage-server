// server.js

// ====================================MONGO DB CONNECTION ==========================
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs'); // Import bcrypt for password hashing
const jwt = require('jsonwebtoken'); // Import jsonwebtoken for creating and verifying tokens
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 5000;
const path = require('path')

var cors = require('cors')

app.use(cors()) // Use this after the variable declaration


require('dotenv').config();
// Middleware
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect('mongodb+srv://finsage.z92mz4c.mongodb.net/?retryWrites=true&w=majority&appName=FinSage', {
    user: process.env.MONGO_USERNAME, 
    pass: process.env.MONGO_PASSWORD,
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// This code should be added in your server's main file (e.g., server.js)

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization; // Assuming token is sent in the Authorization header
  if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    //console.log(decoded)
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid token.' });
  }
};



// Signup Route
app.post('/api/signup', async (req, res) => {
  try {
    const { username, email, password, age, profession } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
    const newUser = new User({ username, email, password: hashedPassword, age, profession });
    await newUser.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Login Route
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password); // Compare hashed passwords
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET); // Create JWT token
    res.status(200).json({ token });
  } catch (error) {
    //console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// User Profile Route
app.get('/api/user-profile', verifyToken, async (req, res) => {
  try {
      // Fetch user details using the user ID from the token
      const user = await User.findById(req.user.userId);
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }
      // Send user details in response
      res.status(200).json(user);
  } catch (error) {
      //console.error(error);
      res.status(500).json({ message: 'Server Error' });
  }
});

// This code should be added in the file where you define your routes (e.g., routes.js)
// Example protected route
app.get('/api/protected', verifyToken, (req, res) => {
  // Access the authenticated user's information from req.user
  const userId = req.user.userId;
  // Perform actions for authenticated users
  res.status(200).json({ message: 'Protected route accessed successfully.' });
});

// Route to update user's investment details
app.post('/api/investments', verifyToken, async (req, res) => {
  try {
      const { symbol, quantity, costPerUnit } = req.body;
      const userId = req.user.userId;

      // Find the user by ID
      const user = await User.findById(userId);
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      // Add new investment to user's investments array
      user.investments.push({ symbol, quantity, costPerUnit });
      await user.save();

      res.status(200).json({ message: 'Investment added successfully' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
  }
});




app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));


// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  age: Number,
  profession: String,
});

const User = mongoose.model('User', userSchema);

module.exports = User;

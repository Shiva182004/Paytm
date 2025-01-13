// backend/db.js
const mongoose = require('mongoose');

mongoose.connect("mongodb+srv://shivasharmarag:qoW7JYsvb2cWrZ52@cluster0.sg6th.mongodb.net/Paytm");

// Create a Schema for Users
const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    firstName: String,
    lastName: String
});

// Create a model from the schema
const User = mongoose.model('User', userSchema);

module.exports = {
	User
};
const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");
const { number } = require('zod');

mongoose.connect("mongodb+srv://shivasharmarag:qoW7JYsvb2cWrZ52@cluster0.sg6th.mongodb.net/Paytm");

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    firstName: String,
    lastName: String
});

userSchema.methods.createHash = async function (plainTextPassword) {
    const saltRound = 10;

    const salt = await bcrypt.genSalt(saltRound);
    return await bcrypt.hash(plainTextPassword, salt);
};

userSchema.methods.validatePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password_hash);
};

const User = mongoose.model('User', userSchema);


const AccountSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, // Reference to User model
        ref: 'User',
        required: true
    },
    balance: {
        type: Number,
        required: true
    }
})

const Account = mongoose.model("Account", AccountSchema);

module.exports = {
	User,
    Account
};
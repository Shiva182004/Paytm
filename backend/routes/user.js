const express = require('express');
const zod = require("zod");
const { User, Account } = require('../db');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { JWT_SECRET } = require("../config");
const { authMiddleware } = require("../middleware");

const router = express.Router();

const signupBody = zod.object({
    username: zod.string().email(),
    firstName: zod.string(),
    lastName: zod.string(),
    password: zod.string()
});

router.post("/signup", async (req, res) => {
    const { success, data, error } = signupBody.safeParse(req.body);

    if (!success) {
        return res.status(422).json({
            message: "Invalid input",
            details: error.errors
        });
    }

    const existingUser = await User.findOne({ username: data.username });
    if (existingUser) {
        return res.status(409).json({
            message: "Email already taken"
        });
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await User.create({
        username: data.username,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
    });

    await Account.create({
        userId: user._id,
        balance: 1 + Math.random()*10000
    })

    const token = jwt.sign({ userId: user._id }, JWT_SECRET);

    res.status(201).json({
        message: "User created successfully",
        token: token
    });
});

const signinBody = zod.object({
    username: zod.string().email(),
    password: zod.string()
});

router.post("/signin", async (req, res) => {
    const { success, data, error } = signinBody.safeParse(req.body);

    if (!success) {
        return res.status(422).json({
            message: "Invalid input",
            details: error.errors
        });
    }

    const user = await User.findOne({ username: data.username });

    if (user && await bcrypt.compare(data.password, user.password)) {
        const token = jwt.sign({ userId: user._id }, JWT_SECRET);

        return res.status(200).json({
            message: "Login successful",
            token: token
        });
    }

    res.status(401).json({
        message: "Invalid username or password"
    });
});

const updateBody = zod.object({
    firstName: zod.string().optional(),
    lastName: zod.string().optional(),
    password: zod.string().optional()
});

router.put("/", authMiddleware , async (req, res) => {
    try {
        // Validate the request body using Zod
        const { success, data, error } = updateBody.safeParse(req.body);

        if (!success) {
            return res.status(422).json({
                message: "Validation failed",
                details: error.errors
            });
        }

        // If password is provided, hash it
        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10);
        }

        // Update the user in the database
        const result = await User.updateOne({ _id: req.userId }, data);

        if (result.nModified === 0) {
            return res.status(404).json({
                message: "User not found or no changes made"
            });
        }

        res.status(200).json({
            message: "Updated Successfully"
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "An error occurred while updating user information"
        });
    }
});

router.get("/bulk", async (req, res) => {
    const filter = req.query.filter || "";

    const users = await User.find({
        $or:[{
            firstName:{
                "$regex":filter
            }
        }, {
            lastName: {
                "$regex":filter
            }
        }]
    })

    res.json({
        user: users.map(user => ({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id
        }))
    })
})

module.exports = router;

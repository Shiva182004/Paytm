const {JWT_SECRET} = require("./config");
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    const authHeaders = req.headers.authorization;

    // Check if Authorization header exists and starts with "Bearer"
    if (!authHeaders || !authHeaders.startsWith('Bearer ')) {
        return res.status(403).json({ message: "Missing or invalid Authorization header" });
    }

    // Extract the token
    const token = authHeaders.split(' ')[1]; // Split on space and get the second part (the token)

    try {
        // Verify the token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Check if userId exists in the decoded token
        if (decoded.userId) {
            req.userId = decoded.userId; // Attach userId to the request object
            next(); // Proceed to the next middleware or route handler
        } else {
            return res.status(403).json({ message: "Invalid token payload" });
        }
    } catch (err) {
        // Handle token verification errors
        return res.status(403).json({ message: "Invalid or expired token" });
    }
};


module.exports = {
    authMiddleware
}
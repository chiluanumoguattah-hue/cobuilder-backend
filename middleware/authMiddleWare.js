const jwt = require("jsonwebtoken")
const User = require("../models/schema")


const protect = async (req,res,next) => {
    try {
        const authHeader = req.headers.authorization
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(404).json({message: "Not authorized, token missing"})
        }
        const token = authHeader.split(" ")[1]
        const decoded = jwt.verify(token,process.env.JWT_SECRET)

        req.user = await User.findById(decoded.id).select('-password')
        if (!req.user)
            return res.status(404).json({message: "User not found"})

        next()
    } catch (error) {
        console.error("Auth error:", err.message);
        res.status(404).json({message: "Not authorized"})
        
    }
}

module.exports = {protect}
const express = require("express")
const router = express.Router()
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")
const User = require("../models/schema")
const sendEmail = require("../utils/sendEmail")

const signToken = (user) =>{
    return jwt.sign({id: user._id}, process.env.JWT_SECRET,{
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    })
}


router.post("/signup", async (req,res) => {
    try {
        const {email,password} = req.body
        if (!email || !password)
            return res.status(404).json({message: "Please provide email and password"})
        // check for existing user
        const existing = await User.findOne({email})
        if (existing)
            return res.status(404).json({message: "Email is already registered"})

        // hash password
        const salt = await bcrypt.genSalt(10)
        const hashed = await bcrypt.hash(password,salt)

        // create user
        const user = new User({email,password: hashed})
        await user.save()

        const token = signToken(user)

        res.status(201).json({message: "User created",user:{id: user._id,email: user.email, password: user.password},token})
    } catch (error) {
        console.error("Signup error:", error.message);
        res.status(500).json({message: "server error"})
        
    }
})


   

router.post("/login", async (req,res) => {
    try {
        const {email,password} = req.body
        if (!email || !password)
            return res.status(404).json({message: "Please provide neccassary information"})

        const userExist = await User.findOne({email})
        if (!userExist)
            return res.status(404).json({message: "Email has not been registered"})

        const authenticated = await bcrypt.compare(password,userExist.password)

        if (!authenticated)
            return res.status(404).json({message: "email or password is incorrect"})

        const token = signToken(userExist)

        res.status(201).json({message: "Logged in",user: {id: userExist._id,email: userExist.email},token})
    } catch (error) {
        console.error("login error:",error.message);
        res.status(500).json({message: "Server error"})
        
    }
});

router.post("/forgot-password", async (req,res) => {
    try {
        const { email } = req.body
        if (!email)
            return res.status(404).json({message: "Please provide an email"});

        const user = await User.findOne({email})
        if (!user)
            return res.json({
        message: "If that email exists, a reset link has been sent"})

        const resetToken = crypto.randomBytes(32).toString("hex")
        const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex")

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = Date.now() + 60 * 60 * 1000;
        await user.save()

        const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

        const html = `
  <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 30px;">
    <div style="max-width: 500px; margin: auto; background: white; border-radius: 10px; padding: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
      <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
      <p style="font-size: 15px; color: #555;">
        Hello, <br/><br/>
        You recently requested to reset your password. Click the button below to choose a new password.
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #007bff; color: white; text-decoration: none; padding: 12px 25px; border-radius: 5px; font-weight: bold;">
          Reset My Password
        </a>
      </div>
      <p style="font-size: 13px; color: #888;">
        If you didn’t request a password reset, you can safely ignore this email. <br/>
        This link will expire in 1 hour.
      </p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="font-size: 12px; color: #aaa; text-align: center;">
        &copy; ${new Date().getFullYear()} Baybe — All rights reserved.
      </p>
    </div>
  </div>`;
  await sendEmail({
    to: user.email,
    subject: "Password Reset Instruction",
    html
  })
  res.json({message: "If that email exists, a reset link has been sent"})
    } catch (err) {
        console.error("Forget password error: ", err.message);
        res.status(500).json({message: "Server error"})
    }
})

router.post("/reset-password/:token", async (req,res) => {
    try {
        const token = req.params.token
        const {password} = req.body
        if (!password)
            return res.status(404).json({message: "Please provide a new password"})

        const hashedToken = crypto.createHash("sha256").update(token).digest("hex")
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: {$gt: Date.now()}
        })
        if (!user)
            return res.status(404).json({
        message: "Invalid or expired token"})

        // hash the new password
        const salt = await bcrypt.genSalt(10)
        user.password = await bcrypt.hash(password,salt)
        user.resetPasswordToken = undefined
        user.resetPasswordExpires = undefined
        await user.save()

        res.json({message: "Password reset successful"})
    } catch (error) {
        console.error("Reset password error: ", error.message);
        res.status(500).json({message: "server error"})
        
    }
})

module.exports = router
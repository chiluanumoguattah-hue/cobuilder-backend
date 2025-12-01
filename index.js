require("dotenv").config()
const express = require("express")
const app = express()
const cors = require("cors")
const PORT = process.env.PORT || 5500
const mongoose = require("mongoose")
const authRoutes = require("./routes/auth")
const {protect} = require("./middleware/authMiddleWare")
const bookingRouter = require("./routes/booking")


app.use(cors())
app.use(express.json())
app.use("/api/bookings", bookingRouter)
app.use("/api/auth", authRoutes)
app.get("/api/auth/me", protect, (req,res)=>{
    req.json({user: req.user})
})
app.get("/", (req,res)=>{
    res.send("SERVER RUNNING")
})

const server = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        app.listen(PORT, ()=>{
            console.log(`server is listening on port ${PORT}`);
            
        })
    } catch (error) {
        console.log(error);
        
    }
}
server()
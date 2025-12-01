const mongoose = require("mongoose")


const bookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", 
        required: true
    },
    // user details
    firstName: {
        type: String,
        required: true,
        trim: true,
    },
    lastName: {
        type:String,
        required: true,
        trim: true,
    },
    email :{
        type:String,
        required: true,
        trim: true,
        lowercase: true,
    },
    
    phone: {
        type: String,
    },
    // space selection
    bedrooms:{
        type: Number,
        required: true,
        min: 1,
        max: 4,
    },
    bathrooms: {
        type: Number,
        required: true,
        min: 1,
        max: 4,
    },

    // service selection
    serviceType:{
        type: String,
        enum: ["standard", "deep", "post_construction"],
        required: true,
    },

    frequency: {
        type: String,
        enum: ["one_time", "weekly", "two_weeks", "four_weeks"],
        required: true,
    },

    // price computed by server
    price:{
        type: Number,
        required: true,
    },

    // status
    status:{
        type: String,
        enum: ["pending", "done", "cancelled"],
        default: "pending"
    },

    scheduledDate:{
        type: Date,
        default: Date.now,
    },
})

// improving our code by adding an index to fetch bookings faster
bookingSchema.index({user:1,createdby: -1})

module.exports = mongoose.model("Booking", bookingSchema)
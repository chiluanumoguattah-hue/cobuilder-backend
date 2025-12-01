const express = require("express")
const router = express.Router()
const Booking = require("../models/Bookings")
const {protect} = require("../middleware/authMiddleWare")
const User = require("../models/schema")

router.post('/', protect, async (req, res) => {
  try {
    const user = req.user;

    const {
      firstName,
      lastName,
      email,
      phone,
      bedrooms,
      bathrooms,
      serviceType,
      frequency,
      price,
      scheduledDate
    } = req.body;
    console.log(req.body);
    
    

    // Basic validation
    if (!firstName || !lastName || !email) {
      return res.status(400).json({ message: 'Name and email are required.' });
    }

    if (!serviceType || !frequency) {
      return res.status(400).json({ message: 'Service type and frequency are required.' });
    }

    // Match logged-in user's email for security
    if (user.email !== String(email).toLowerCase()) {
      return res.status(403).json({ message: 'Email does not match logged-in user.' });
    }

    // Save booking to database
    const booking = new Booking({
      user: user._id,
      firstName,
      lastName,
      email,
      phone,
      bedrooms,
      bathrooms,
      serviceType,
      frequency,
      price,
      scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined
    });

    

    await booking.save();
    res.status(201).json({ message: 'Booking created successfully', booking });
  } catch (err) {
    console.error('Booking error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// get all bookings
router.get("/", protect, async (req,res) => {
  try {
    const user = req.user
    const bookings = await Booking.find({user: user.id}).sort({createdAt: -1})
    res.json({bookings})
  } catch (error) {
    console.log(error);
    res.status(500).json({message: error.message})
    
  }
})

// update status
router.put("/:id/status", protect, async (req,res) => {
  try {
    const user = req.user
    const {status} = req.body
    const booking = await Booking.findById(req.params.id)
    if (!booking) return res.status(404).json({message: "Booking not found"})

      // only owner can change status
      if(String(booking.user) !== String(user._id)){
        return res.status(404).json({message: "Not allowed to update this booking"})
      }
      if(!["pending", "done", "cancelled"].includes(status)){
        return res.status(404).json({message: "Invalid status"})
      }
      booking.status = status
      await booking.save()
      res.json({message: "Status updated", booking: user})
  } catch (error) {
    console.error("Update status error:", error.message);
    res.status(500).json({message: "Server error"})
    
  }
})

// update
router.put("/:id", protect, async (req,res) => {
  try {
    const {status} = req.body

    const booking = await Booking.findByIdAndUpdate(req.params.id, {status}, {new: true})

    if (!booking) {
      return res.status(404).json({message: "Booking not found"})
    }
    res.json(booking)
  } catch (error) {
    console.error("Update booking error", error.message);
    res.status(500).json({message: "Server Error"})
    
  }
})

// delete
router.delete("/:id", protect, async (req,res) => {
  try {
    const user = req.user
    const booking = await Booking.findById(req.params.id)
    if(!booking) return res.status(404).json({message: "Bookind not found"})

      if (String(booking.user) !== String(user._id)) {
        return res.status(404).json({message: "Not allowed to cancel this booking"})
      }
      booking.status = "cancelled"
      await booking.save()
      res.json({message: "Booking cancelled", booking})
  } catch (error) {
    console.error("Cancel booking error", error.message);
    res.status(500).json({message: "Server Error"})
    
  }
})
module.exports = router
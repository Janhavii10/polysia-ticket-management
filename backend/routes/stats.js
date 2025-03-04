const express = require("express");
const router = express.Router();
const Ticket = require("../models/Ticket"); // Adjust based on your model structure
const User = require("../models/User"); // Adjust based on your model structure

// Fetch all tickets and users without processing
router.get("/", async (req, res) => {
  try {
    const tickets = await Ticket.find(); // Fetch all tickets
    const users = await User.find(); // Fetch all users

    res.json({ tickets, users });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;

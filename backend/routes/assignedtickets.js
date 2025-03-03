
// router.get("/api/assignedtickets", authenticate, async (req, res) => {
//     try {
//         const agentId = req.user.agent_id;
//         const tickets = await Ticket.find({ agent_id: agentId });
//         res.json({ tickets });
//     } catch (error) {
//         res.status(500).json({ message: "Server Error", error });
//     }
// });

// module.exports = router;

const express = require("express");
const router = express.Router();
const Ticket = require("../models/Ticket"); // Import Ticket model
const authenticate = require("../middleware/authenticate");

router.get("/assignedtickets", authenticate, async (req, res) => {
  try {
    const agentId = req.user.id; // Get logged-in user's ID
    const tickets = await Ticket.find({ agent_id: agentId });

    res.json({ tickets });
  } catch (error) {
    console.error("Error fetching assigned tickets:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;

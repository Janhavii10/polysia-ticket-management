require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Ticket = require('./models/Ticket');
const PendingUser = require('./models/PendingUser'); // Import PendingUser model
const ticketsRouter = require("./routes/createtickets");
const path = require("path");


const app = express();

const PORT = process.env.PORT || 5000;
const SECRET_KEY = process.env.SECRET_KEY;

app.use(express.json());
const corsOptions = {
  origin: "https://ticket-management-k5lr.onrender.com", // Your frontend URL
  methods: "GET,POST,PUT,DELETE,OPTIONS",
  allowedHeaders: "Content-Type,Authorization",
  credentials: true, // Allow authentication headers
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// Middleware
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Serve uploaded files
app.use(ticketsRouter);


// MongoDB Connection
const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => console.log("MongoDB Connected")).catch(err => console.error(err));

// Middleware to authenticate JWT
const authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Access Denied' });

  try {
    const verified = jwt.verify(token, SECRET_KEY);
    req.user = verified; // Add user data to the request
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid Token' });
  }
};

// Register Endpoint (For Testing)
const bcrypt = require('bcryptjs'); // Import bcrypt
const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS); // Number of salt rounds for hashing

app.post('/api/register', async (req, res) => {
  const { user_id, name, email, password, role, profile_image } = req.body;

  try {
    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const pendingUser = new PendingUser({
      user_id,
      name,
      email,
      password: hashedPassword, // Store hashed password
      role,
      profile_image,
    });

    await pendingUser.save();
    res.status(201).json({ message: 'Registration pending approval by admin' });
  } catch (err) {
    res.status(400).json({ message: 'Error registering user', error: err.message });
  }
});



// Login Endpoint

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      const pendingUser = await PendingUser.findOne({ email });
      if (pendingUser) {
        return res.status(403).json({ message: 'Your registration is pending admin approval' });
      }
      return res.status(404).json({ message: 'User not found' });
    }

    // Compare the hashed password with the entered password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,  // Use the correct env variable
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({ 
      message: 'Login successful', 
      token, 
      role: user.role, 
      user: { id: user.user_id, email: user.email, role: user.role, name: user.name } // Send only necessary data 
    });
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

const forgotPasswordRoutes = require("./routes/forgotpassword");
app.use("/api", forgotPasswordRoutes);

// Profile Endpoint
app.get('/api/user/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      name: user.name,
      email: user.email,
      role: user.role,
      profile_image: user.profile_image,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});



// Get all tickets
app.get('/api/showtickets', authenticate, async (req, res) => {
  try {
    const tickets = await Ticket.find(); // Fetch all tickets from MongoDB
    res.json({ tickets });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching tickets', error: err.message });
  }
});

// Admin Approval Endpoint
app.post('/api/admin/approve', async (req, res) => {
  const { pendingUserId } = req.body;

  try {
    const pendingUser = await PendingUser.findById(pendingUserId);
    if (!pendingUser) {
      return res.status(404).json({ message: 'Pending user not found' });
    }

    // Ensure password is hashed before moving to the User collection
    const user = new User({
      user_id: pendingUser.user_id,
      name: pendingUser.name,
      email: pendingUser.email,
      password: pendingUser.password, // Password is already hashed from registration
      role: pendingUser.role,
      profile_image: pendingUser.profile_image,
    });

    await user.save();
    await PendingUser.findByIdAndDelete(pendingUserId);

    res.status(200).json({ message: 'User approved and added to the system' });
  } catch (err) {
    res.status(500).json({ message: 'Error approving user', error: err.message });
  }
});


// Reject Pending User Endpoint
app.post('/api/admin/reject', async (req, res) => {
  const { pendingUserId } = req.body;

  try {
    const pendingUser = await PendingUser.findById(pendingUserId);
    if (!pendingUser) {
      return res.status(404).json({ message: 'Pending user not found' });
    }

    // Delete the pending user
    await PendingUser.findByIdAndDelete(pendingUserId);

    res.status(200).json({ message: 'User rejected and removed from the system' });
  } catch (err) {
    res.status(500).json({ message: 'Error rejecting user', error: err.message });
  }
});


// Get All Pending Users
app.get('/api/admin/pending-users', async (req, res) => {
  try {
    const pendingUsers = await PendingUser.find();
    res.status(200).json({ pendingUsers });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching pending users', error: err.message });
  }
});

const changePasswordRouter = require("./routes/changepassword"); // Import change password route
app.use(changePasswordRouter); // Change password route

const prevTicketsRouter = require("./routes/prevtickets");
app.use(prevTicketsRouter);

const assignAgentsRouter = require("./routes/assignagents"); // Updated import
app.use(assignAgentsRouter); // Updated route

const assignedTicketRouter = require("./routes/assignedtickets");
app.use("/api", assignedTicketRouter);

const ticketDetailsRouter = require("./routes/ticketdetails");
app.use(ticketDetailsRouter);

const commentRoutes = require("./routes/comments");
app.use("/api/ticket", commentRoutes);

const closeTicketRouter = require("./routes/closeticket"); // Import the routes
app.use(closeTicketRouter);

const ratingRouter = require("./routes/rating");
app.use(ratingRouter);

//--------------------------------------------------------------------------------

const __dirname1 = path.resolve(); // Correct way to get absolute path

// Middleware to parse JSON requests
app.use(express.json());

if (process.env.NODE_ENV === "production") {
  // Serve React frontend in production
  app.use(express.static(path.join(__dirname1, "/frontend/build")));

  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname1, "frontend", "build", "index.html"))
  );
} else {
  // Development mode: Show API message
  app.get("/", (req, res) => {
    res.send("API is running...");
  });
}

// -------------------------------------------------------------------------------

// Server Start
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
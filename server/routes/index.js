require("dotenv").config();
const express = require("express");
const router = express.Router();
const User = require("../models/usersModel");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// register user
router.post("/register", async (req, res) => {
  const { fullname, email, password, confirmPassword } = req.body;
  // check if user is already registered
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(401).json({ msg: "User already exists" });
  }
  // validate user input
  if (!fullname || !email || !password || !confirmPassword) {
    return res.status(400).json({ msg: "Please enter all fields" });
  }

  if (!validator.isLength(fullname, { min: 3, max: 50 })) {
    return res
      .status(400)
      .json({ msg: "Full name must be between 3 and 50 characters" });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({ msg: "Please enter a valid email address" });
  }

  if (!validator.isLength(password, { min: 8 })) {
    return res
      .status(400)
      .json({ msg: "Password must be at least 8 characters long" });
  }

  if (password !== confirmPassword) {
    return res.status(402).json({ msg: "Passwords do not match" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  // create new user
  const newUser = new User({
    fullname,
    email,
    password: hashedPassword,
    confirmPassword,
  });
  try {
    const savedUser = await newUser.save();
    res.status(200).json(savedUser);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// login user
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  // check if user exists
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ msg: "error logging In" });
  }
});

// middleware for authentication
const authMiddleware = (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    console.log("No token provided");
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  const token = authHeader.replace("Bearer", "").trim();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Token verification failed:", err.message);
    res.status(401).json({ msg: "Invalid token" });
  }
};

// get a user
router.get("/user", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// update a user
router.put("/user/:id", async (req, res) => {
  const { fullname, email, currentPassword, password, confirmPassword } =
    req.body;
  if (currentPassword !== password) {
    return res.status(400).json({ msg: "Passwords do not match" });
  }
  if (!fullname || !email || !password || !confirmPassword || !currentPassword) {
    return res.status(400).json({ msg: "Please enter all fields" });
  }
  if (!validator.isLength(fullname, { min: 3, max: 50 })) {
    return res
      .status(400)
      .json({ msg: "Full name must be between 3 and 50 characters" });
  }
  if (!validator.isLength(password, { min: 8 })) {
    return res
      .status(400)
      .json({ msg: "Password must be at least 8 characters long" });
  }
  if (!validator.isEmail(email)) {
    return res.status(400).json({ msg: "Please enter a valid email address" });
  }
  if (password !== confirmPassword) {
    return res.status(402).json({ msg: "Passwords do not match" });
  }

  try {
    const user = await User.findById(request.params.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ msg: "Invalid current password" });
    }
    const codedPassword = await bcrypt.hash(password, 10);
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { fullname, email, password: codedPassword, confirmPassword },
      { new: true }
    );
    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;

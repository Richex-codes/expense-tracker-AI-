const express = require("express");
const Budget = require('../models/budgetModel');
const router = express.Router();
const jwt = require("jsonwebtoken");
const { findOne } = require("../models/usersModel");

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

// create a budget
router.post('/save', authMiddleware, async (req, res) => {
    try {
    const {totalBudget, categories, month} = req.body;
    const userId = req.user.id;
    let budget = await Budget.findOne({userId, month});
    if(budget) {
        budget.totalBudget = totalBudget;
        budget.categories = categories;
    } else{
        budget = new Budget({
            userId,
            totalBudget,
            month,
            categories 
        });
    }
    const savedBudget = await budget.save();
    res.status(200).json({message: 'saved budget successfully', savedBudget});

    } catch(err) {
        res.status(500).json({msg: err.message})
    }

})

// get user budget
router.get('/user', authMiddleware, async (req, res) => {
    try {
      const userId = req.user.id;
      // Get current month in YYYY-MM format
      const month = new Date().toISOString().slice(0, 7);
  
      // Find the budget for this user and month
      const budget = await Budget.findOne({ userId, month });
  
      if (!budget) {
        return res.status(404).json({ msg: 'Budget not found' });
      }
  
      res.status(200).json(budget);
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  });
  
  module.exports = router;
  
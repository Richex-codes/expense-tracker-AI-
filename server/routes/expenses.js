const express = require("express");
const Expense = require("../models/expenseModel");
const router = express.Router();
const jwt = require("jsonwebtoken");

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

// get all expenses
// This endpoint retrieves all expenses for the current user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const expenses = await Expense.find({userId}).sort({ date: -1 });
    res.status(200).json(expenses);
  } catch (err){
    console.error("Error fetching expenses:", err.message);
    res.status(500).json({ msg: "Failed to fetch expenses" });
  }
})

// save an expense
router.post("/save", authMiddleware, async (req, res) => {
  const { amount, category, description, date } = req.body;
  const userId = req.user.id;
  const newExpense = new Expense({
    userId,
    amount,
    category,
    description,
    date,
  });
  try {
    const savedExpense = await newExpense.save();
    res.status(200).json(savedExpense);
  } catch (error) {
    res.status(500).json(error);
  }
});

// get expenses in a specific date range
// This endpoint is used to filter expenses based on a date range
router.get("/filter", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { from, to } = req.query;

    const query = {
      userId,
    };

    if (from && to) {
      query.date = {
        $gte: new Date(from),
        $lte: new Date(to),
      };
    }

    const expenses = await Expense.find(query).sort({ date: -1 });

    res.status(200).json(expenses);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// get all expenses for the current month
// This endpoint retrieves all expenses for the current month
router.get("/monthly", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // Jan = 0

    const startOfMonth = new Date(year, month, 1);
    const startOfNextMonth = new Date(year, month + 1, 1);

    const expenses = await Expense.find({
      userId,
      date: {
        $gte: startOfMonth,
        $lt: startOfNextMonth,
      },
    }).sort({ date: -1 });

    res.status(200).json(expenses);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});




//delete an expense
// This endpoint deletes an expense by its ID
router.delete("/delete/:id", async (req, res) => {
  try {
    const deletedExpense = await Expense.findByIdAndDelete(req.params.id);
    res.status(200).json(deletedExpense);
  } catch (error) {
    res.status(500).json(error);
  }
});

//update an expense
router.put("/update/:id", async (req, res) => {
  const { amount, category, description, date } = req.body;
  try {
    const updatedExpense = await Expense.findByIdAndUpdate(
      req.params.id,
      { amount, category, description, date },
      { new: true }
    );
    res.status(200).json(updatedExpense);
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;

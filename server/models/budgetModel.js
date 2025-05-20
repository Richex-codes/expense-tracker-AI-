const mongoose = require("mongoose");

const BudgetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  totalBudget: { type: Number, required: true },
  month: { type: String, required: true }, // e.g. "2025-05"
  categories: [
    {
      name: String,
      budgetAmount: Number,
      spent: { type: Number, default: 0 },
    },
  ],
}, { timestamps: true }); // Optional: for createdAt and updatedAt


module.exports = mongoose.model("Budget", BudgetSchema);

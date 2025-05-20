const mongoose = require('mongoose');
const schema = mongoose.Schema;
// const User = require('./usersModel')

const expenseSchema =new schema({
    userId: {
        type:mongoose.Schema.Types.ObjectId,
        ref: 'User',  // this references the User model by id
        required: true
    },
    amount:{
        type: Number,
        required: true
    },
    category:{
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    date:{
        type: Date,
        default: Date.now
    } 
}, {timestamps: true})

module.exports = mongoose.model('Expense', expenseSchema);
require('dotenv').config()
const express = require('express')
const cors = require('cors');
const mongoose = require('mongoose');
const usersRouter = require('./routes/index');
const expensesRouter = require('./routes/expenses');
const budgetRouter = require('./routes/budget');
const aiInsights = require('./routes/ai-insights'); 

const app = express();



app.use(express.json());
app.use(cors());
app.use('/', usersRouter);
app.use('/expense', expensesRouter);
app.use('/budget', budgetRouter);
app.use('/ai', aiInsights)


const port = process.env.PORT || 3001;

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Could not connect to MongoDB', err))



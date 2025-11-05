const express = require("express");
const cors = require("cors");
const passport = require('passport');
const cookieParser = require('cookie-parser');

require("dotenv").config();
require('./config/passport');

// Routes
const authRoutes = require('./routes/auth.route');

const app = express();

// Middlewares
app.use(
  cors({
    origin: process.env.FE_URL || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(passport.initialize());

app.use('/api/auth', authRoutes);


const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Server is running!");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

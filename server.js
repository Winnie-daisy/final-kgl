// 1. Dependencies
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const passport = require("passport");
const moment = require("moment");
const session = require("express-session");
require("dotenv").config();

// Import user model (used for passport config)
const Signup = require("./models/Signup");
const Sale = require("./models/Sale");
const Purchase = require("./models/Purchase");
const Credit = require("./models/Credit");

// 2. Instantiations
const app = express();
const PORT = 3000;

// 3. Database connection with proper configuration for transactions
mongoose.connect(process.env.DATABASE, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  retryWrites: true
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

mongoose.connection.on('error', err => {
  console.error(`MongoDB connection error: ${err}`);
});

// 4. App configurations
app.locals.moment = moment;
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// 5. Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// ✅ Proper session middleware setup
app.use(session({
  secret: "secret", // replace with a strong secret in production
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Passport config
passport.use(Signup.createStrategy());
passport.serializeUser(Signup.serializeUser());
passport.deserializeUser(Signup.deserializeUser());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// 6. Routes
const authRoutes = require("./routes/authRoutes");
const mdashRoutes = require("./routes/mdashRoutes");
const admindashRoutes = require("./routes/admindashRoutes");
const salersdashRoutes = require("./routes/salersdashRoutes");
const indexRoutes = require("./routes/indexRoutes");
const salesRoutes = require("./routes/salesRoutes");
const purchaseRoutes = require("./routes/purchaseRoutes");
const creditRoutes = require("./routes/creditRoutes");
const logoutRoutes = require("./routes/logoutRoutes");

app.use("/", authRoutes);
app.use("/", mdashRoutes);
app.use("/", admindashRoutes);
app.use("/", salersdashRoutes);
app.use("/", indexRoutes);
app.use("/", salesRoutes);
app.use("/", purchaseRoutes);
app.use("/", creditRoutes);
app.use("/", logoutRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message
  });
});

// 7. Start server
app.listen(PORT, () => {
  console.log(`Server running at port ${PORT}`);
});

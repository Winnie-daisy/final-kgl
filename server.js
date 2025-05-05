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

// 3. Database connection
mongoose.connect(process.env.DATABASE);

mongoose.connection
  .on("open", () => {
    console.log("Mongoose connection open");
  })
  .on("error", (err) => {
    console.error(`Connection error: ${err.message}`);
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
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Passport config
passport.use(Signup.createStrategy());
passport.serializeUser(Signup.serializeUser());
passport.deserializeUser(Signup.deserializeUser());

// 6. Routes
const authRoutes = require("./routes/authRoutes");
const mdashRoutes = require("./routes/mdashRoutes");
const admindashRoutes = require("./routes/admindashRoutes");
const salersdashRoutes = require("./routes/salersdashRoutes");
const indexRoutes = require("./routes/indexRoutes");
const salesRoutes = require("./routes/salesRoutes");
const purchaseRoutes = require("./routes/purchaseRoutes");
const creditRoutes = require("./routes/creditRoutes")

app.use("/", authRoutes);
app.use("/", mdashRoutes);
app.use("/", admindashRoutes);
app.use("/", salersdashRoutes);
app.use("/", indexRoutes);
app.use("/", salesRoutes);
app.use("/", purchaseRoutes);
app.use("/", creditRoutes);

// 7. Start server
app.listen(PORT, () => {
  console.log(`Server running at port ${PORT}`);
});

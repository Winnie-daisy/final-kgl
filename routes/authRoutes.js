const express = require("express");
const passport = require("passport");
const router = express.Router();

// Import user model
const Signup = require("../models/Signup");

// GET: Signup form (rendered with login.pug and toggled via flag)
router.get("/signup", (req, res) => {
  res.render("login", { showSignup: true });
});

// POST: Signup handler
router.post("/signup", async (req, res) => {
  try {
    const { email, password, branch, userType, fullName } = req.body;

    // Prevent empty required fields
    if (!email || !password || !userType) {
      return res.render("login", {
        showSignup: true,
        error: "All fields are required.",
      });
    }

    const existingUser = await Signup.findOne({ email });
    if (existingUser) {
      return res.render("login", {
        showSignup: true,
        error: "Email already exists. Please use a different one.",
      });
    }

    const newUser = new Signup({ fullName, email, branch, userType });

    Signup.register(newUser, password, (err) => {
      if (err) {
        console.error("Registration error:", err);
        return res.render("login", {
          showSignup: true,
          error: "Registration failed. Please try again.",
        });
      }

      console.log("User registered:", newUser);
      res.redirect("/signin");
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.render("login", {
      showSignup: true,
      error: "Unexpected error occurred.",
    });
  }
});

// GET: Signin form
router.get("/signin", (req, res) => {
  res.render("login", { showSignup: false });
});

// POST: Login handler
router.post(
  "/signin",
  passport.authenticate("local", {
    failureRedirect: "/signin",
  }),
  (req, res) => {
    req.session.user = req.user;

    if (req.user.userType === "manager"){
      res.redirect("/mdashRoutes");
    }
    else if (req.user.userType === "salesAgent"){
      res.redirect("/salersdashRoutes");
   }
    else if (req.user.userType === "director"){
    res.redirect("/admindashRoutes");
    }else {
   res.send("You do not have any role in the system")
}
});


module.exports = router;

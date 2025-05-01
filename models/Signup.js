const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const signupSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/.+@.+\..+/, 'Please use a valid email address'],
    },
    userType: {
      type: String,
      enum: ['director', 'manager', 'salesAgent'],
      required: [true, 'User type is required'],
    },
    branch: {
      type: String,
      trim: true,
      required: function () {
        return this.userType === 'manager' || this.userType === 'salesAgent';
      },
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Use 'email' instead of default 'username' for login
signupSchema.plugin(passportLocalMongoose, {
  usernameField: 'email',
  errorMessages: {
    UserExistsError: 'A user with the given email is already registered.',
  },
});

module.exports = mongoose.model('Signup', signupSchema);

const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: 2,
      maxLength: 30,
    },
    lastName: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Invalid email format');
        }
      },
    },
    password: {
      type: String,
      required: true,
      minLength: 6,
      maxLength: 128,
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error('Password should be a strong password');
        }
      },
    },
    age: {
      type: Number,
      min: 12,
      max: 150,
    },
    gender: {
      type: String,
      enum: {
        values: ['Male', 'Female', 'Other'],
        message: '{VALUE} is not valid gender',
      },
      validate(value) {
        const allowedGenders = ['Male', 'Female', 'Other'];
        if (!allowedGenders.includes(value)) {
          throw new Error('Gender must be either Male, Female, or Other');
        }
      },
    },
    photoUrl: {
      type: String,
      default:
        'https://www.pngall.com/wp-content/uploads/5/Profile-PNG-High-Quality-Image.png',
      validate(value) {
        if (!validator.isURL(value)) {
          throw new Error('Invalid URL format for photoUrl');
        }
      },
    },
    about: {
      type: String,
      default: 'This user prefers to keep an air of mystery about them.',
    },
    skills: {
      type: [String],
      minItems: 0,
      maxItems: 10,
    },
  },
  { timestamps: true }
);

userSchema.methods.getJWT = async function () {
  const user = this;
  const token = await jwt.sign({ _id: user._id.toString() }, 'Shanth@1996', {
    expiresIn: '1h',
  });
  return token;
};

userSchema.methods.validatePassword = async function (password) {
  const user = this;
  return await bcrypt.compare(password, user.password);
};

const User = mongoose.model('User', userSchema, 'users');

module.exports = User;

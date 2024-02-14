const express = require('express')
const router = express.Router()
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcryptjs')
const { query, validationResult } = require('express-validator')
const User = require('../models/userSchema')

router.get('/', function (req, res, next) {
  res.render('home', { title: 'Home Page' })
})

router.get('/signup', function (req, res, next) {
  res.render('signup', { title: 'Sign up Page' })
})

module.exports = router

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
  res.render('form', { 
    title: 'Sign up',
    url: req.url,
   })
})

router.post('/signup', [
  query('username').trim().escape(),
  query('password').trim().escape(),
  query('confirm_password').trim().escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req)

    if (req.body.password !== req.body.confirm_password) {
      res.render('form', {
        title: 'Sign up',
        url: req.url,
        errors: [{ msg: 'Passwords do not match' }],
      })
      return
    }

    if (!errors.isEmpty()) {
      res.render('form', {
        title: 'Sign up',
        url: req.url,
        errors: errors.array(),
      })
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    const user = new User({
      username: req.body.username,
      password: hashedPassword,
      member_status: 'Member',
      date_joined: new Date(),
    })
    try {
      await user.save()
      res.redirect('/home')
    } catch (err){
      console.log(err)
    }
  }),
])

router.get('/login', function (req, res, next) {
  res.render('form', {
    title: 'Log in',
    url: req.url,
  })
})

module.exports = router

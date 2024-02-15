const express = require('express')
const router = express.Router()
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcryptjs')
const passport = require('passport')
const { query, validationResult } = require('express-validator')
const User = require('../models/userSchema')

router.get('/', function (req, res, next) {
  res.render('home', { title: 'Home Page', user: req.user })
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
    const findUser = await User.findOne({ username: req.body.username })

    if (findUser) {
      res.render('form', {
        title: 'Sign up',
        url: req.url,
        errors: [{ msg: 'Username is already taken' }],
      })
      return
    }

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
      req.logIn(user, function (err) {
        if (err) return next(err)
        res.redirect('/home')
      })
    } catch (err) {
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

router.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/home',
    failureRedirect: '/home/login',
  })
)

router.get('/join-secret-club', function (req, res, next) {
  res.render('form', {
    title: 'Join Secret Club',
    url: req.url,
  })
})

router.post('/join-secret-club', [
  query('secret_word').trim().escape().toLowerCase(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req)
    console.log(req.user)
    if (req.body.secret_word !== 'candle') {
      res.render('form', {
        title: 'Join Secret Club',
        url: req.url,
        errors: [{ msg: 'Incorrect secret word' }],
      })
    }

    if (!errors.isEmpty()) {
      res.render('form', {
        title: 'Join Secret Club',
        url: req.url,
        errors: errors.array(),
      })
      return
    } else {
      await User.findByIdAndUpdate(req.user._id, { member_status: 'Secret Club' })
      res.redirect('/home')
    }
  }),
])

module.exports = router

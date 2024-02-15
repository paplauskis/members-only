const express = require('express')
const router = express.Router()
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcryptjs')
const passport = require('passport')
const { query, validationResult } = require('express-validator')
const User = require('../models/userSchema')
const Message = require('../models/messageSchema')
require('dotenv').config()

router.get(
  '/',
  asyncHandler(async (req, res, next) => {
    const messages = await Message.find({})
      .sort({ date_posted: -1 })
      .populate('author')

    res.render('home', {
      title: 'Home Page',
      user: req.user,
      messages: messages,
    })
  })
)

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

    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    const user = new User({
      username: req.body.username,
      password: hashedPassword,
      member_status: 'Member',
      date_joined: new Date(),
    })

    if (!errors.isEmpty()) {
      res.render('form', {
        title: 'Sign up',
        url: req.url,
        errors: errors.array(),
      })
    } else {
      try {
        await user.save()
        req.logIn(user, function (err) {
          if (err) return next(err)
          res.redirect('/home')
        })
      } catch (err) {
        console.log(err)
      }
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

router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err)
    }
    res.redirect('/home')
  })
})

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
      await User.findByIdAndUpdate(req.user._id, {
        member_status: 'Secret Club',
      })
      res.redirect('/home')
    }
  }),
])

router.get('/admin-form', function (req, res, next) {
  res.render('admin-form', {
    title: 'Become admin',
  })
})

router.post('/admin-form', [
  query('admin_password').trim().escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req)

    if (req.body.admin_password !== process.env.ADMIN_PASSWORD) {
      res.render('admin-form', {
        title: 'Become admin',
        errors: [{ msg: 'Incorrect password' }],
      })
      return
    }

    if (!errors.isEmpty()) {
      res.render('admin-form', {
        title: 'Become admin',
        errors: errors.array(),
      })
      return
    } else {
      try {
        await User.findByIdAndUpdate(req.user._id, { admin: true })
        res.redirect('/home')
      } catch (err) {
        console.log(err)
      }
    }
  }),
])

router.get('/new-message', function (req, res, next) {
  res.render('message-form', {
    title: 'New Message',
  })
})

router.post('/new-message', [
  query('title').trim().escape(),
  query('message').trim().escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req)

    const message = new Message({
      title: req.body.title,
      text: req.body.message,
      author: req.user,
      date_posted: new Date(),
    })

    if (!errors.isEmpty()) {
      res.render('message-form', {
        title: 'New Message',
        errors: errors.array(),
      })
    } else {
      try {
        await message.save()
        res.redirect('/home')
      } catch (err) {
        console.log(err)
      }
    }
  }),
])

router.post(
  '/:id/delete',
  asyncHandler(async (req, res, next) => {
    try {
      await Message.findByIdAndDelete(req.params.id)
      res.redirect('/home')
    } catch (err) {
      console.log(err)
      res.status(500).send('Internal server error')
    }
  })
)

module.exports = router

const asyncHandler = require('express-async-handler')
const bcrypt = require('bcryptjs')
const passport = require('passport')
const { query, validationResult } = require('express-validator')
const User = require('../models/userSchema')
const Message = require('../models/messageSchema')
require('dotenv').config()

exports.home = asyncHandler(async (req, res, next) => {
  const messages = await Message.find({})
    .sort({ date_posted: -1 })
    .populate('author')

  res.render('home', {
    title: 'Home Page',
    user: req.user,
    messages: messages,
  })
})

exports.signup_get = function (req, res, next) {
  res.render('form', {
    title: 'Sign up',
    url: req.url,
  })
}

exports.signup_post = [
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
]

exports.login_get = function (req, res, next) {
  res.render('form', {
    title: 'Log in',
    url: req.url,
    errorMessage: req.flash('error'),
  })
}

exports.login_post = passport.authenticate('local', {
  successRedirect: '/home',
  failureRedirect: '/home/login',
  failureFlash: true,
})

exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err)
    }
    res.redirect('/home')
  })
}

exports.join_secret_club_get = function (req, res, next) {
  res.render('form', {
    title: 'Join Secret Club',
    url: req.url,
  })
}

exports.join_secret_club_post = [
  query('secret_word').trim().escape().toLowerCase(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req)
    console.log(req.user)
    if (req.body.secret_word !== process.env.SECRET_CLUB_PASSWORD) {
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
]

exports.admin_form_get = function (req, res, next) {
  res.render('admin-form', {
    title: 'Become admin',
  })
}

exports.admin_form_post = [
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
]

exports.new_message_get = function (req, res, next) {
  res.render('message-form', {
    title: 'New Message',
  })
}

exports.new_message_post = [
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
]

exports.delete_message_post = asyncHandler(async (req, res, next) => {
  try {
    await Message.findByIdAndDelete(req.params.id)
    res.redirect('/home')
  } catch (err) {
    console.log(err)
    res.status(500).send('Internal server error')
  }
})


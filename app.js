const createError = require('http-errors')
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const mongoose = require('mongoose')
const session = require('express-session')
const passport = require('./config')
const flash = require('connect-flash')
require('dotenv').config()

const indexRouter = require('./routes/index')
const homeRouter = require('./routes/home')

const app = express()

const mongoDB = process.env.MONGO_DB_URI

main().catch((err) => console.log(err))
async function main() {
  await mongoose.connect(mongoDB)
}

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

app.use(session({ secret: 'cats', resave: false, saveUninitialized: true }))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())
app.use(express.urlencoded({ extended: false }))

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', indexRouter)
app.use('/home', homeRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  res.status(err.status || 500)
  res.render('error')
})

module.exports = app

const express = require('express')
const router = express.Router();
const bcrypt = require('bcryptjs')
const passport = require('passport');

// Bring in User Module
const User = require('../models/user')

// Register Form
router.get('/register', (req, res) => {
  res.render('user/register')
})

// Register process
router.post('/register', (req, res) => {
  const name = req.body.name
  const email = req.body.email
  const username = req.body.username
  const password = req.body.password
  const password2 = req.body.password2

  req.checkBody('name', 'Name is required').notEmpty()
  req.checkBody('email', 'Email is required').notEmpty()
  req.checkBody('email', 'Email is not valid').isEmail()
  req.checkBody('username', 'Username is required').notEmpty()
  req.checkBody('password', 'Password is required').notEmpty()
  req.checkBody('password2', 'Password do not match').equals(req.body.password)

  let errors = req.validationErrors()

  if (errors) {
    res.render('user/register', {
      errors: errors
    })
  } else {
    let newUser = new User({
      name: name,
      email: email,
      username: username,
      password: password
    })
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(newUser.password, salt, (err, hash) => {
        if (err) {
          console.log(err)
        }
        newUser.password = hash
        newUser.save((err) => {
          if (err) {
            console.log(err);
            return
          } else {
            req.flash('success', 'You are now registerd and can log in')
            res.redirect('/user/login')
          }
        })
      })
    })
  }
})

router.get('/login', (req, res) => {
  res.render('user/login')
})

// login process
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/user/login',
    failureFlash: true
  })(req, res, next)
})

router.get('/logout', (req, res) => {
  req.logout()
  req.flash('success', 'You are logged out')
  res.redirect('/user/login')
})

module.exports = router

const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const expressValidator = require('express-validator')
const flash = require('connect-flash')
const session = require('express-session')
const passport = require('passport');
const config = require('./config/database')

mongoose.connect(config.database)
let db = mongoose.connection

// Check connection
db.once('open', () => {
  console.log('Connected to MongoDB')
})

// Check for DB erros
db.on('error', (err) => {
  console.log(err)
})

// Init App
const app = express()

// Bring in Models
let Article = require('./models/article')

// Load View Engine
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

// Body parser middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

// set public folder
app.use(express.static(path.join(__dirname, 'public')))

// Express Session Middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}))

// Express Messages Middleware
app.use(require('connect-flash')())
app.use((req, res, next) => {
  res.locals.messages = require('express-messages')(req, res)
  next()
})

// Express Validator Middleware
app.use(expressValidator({
  errorFormatter: (param, msg, value) => {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']'
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    }
  }
}))

// Passport config
require('./config/passport')(passport)
// Passport middleware
app.use(passport.initialize())
app.use(passport.session())

app.get('*', (req, res, next) => {
  res.locals.user = req.user || null
  next()
})

// Home route
app.get('/', (req, res) => {
  // res.send('hello world')
  Article.find({}, (err, articles) => {
    if (err) {
      console.log(err)
    } else {
      res.render('index', {
        title: "Articles",
        articles: articles
      })
    }
  })
})

let article = require('./routes/article');
let user = require('./routes/user');

app.use('/article', article)
app.use('/user', user)

// Start Server
app.listen(3000, () => {
  console.log('Srrver started on port 3000...')
})

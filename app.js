
const express = require('express')
const routes = require('./routes/index')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const passport = require('passport')
const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(passport.initialize())
app.use(passport.session())

app.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*")
	res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS')
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization")
	next()
})

app.use('/', routes);

module.exports = app

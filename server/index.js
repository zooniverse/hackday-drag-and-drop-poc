var express = require('express')
var fs = require('fs')
var http = require('http')
var https = require('https')
var url = require('url')
var jade = require('jade')
var path = require('path')
var parallel = require('run-parallel')
var config = require('../config')
var app = express()
var httpServer = http.createServer(app)
var debug = require('debug')('hackday-drag-and-drop-poc')

// Templating
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')
app.set('x-powered-by', false)
app.engine('jade', jade.renderFile)

app.use(function (req, res, next) {
  next()
})

app.use(express.static(path.join(__dirname, '../static')))

app.get('/', function (req, res) {
  res.render('index', {
    title: 'Test Drag and Drop'
  })
})

app.get('*', function (req, res) {
  res.status(404).render('error', {
    title: '404 Page Not Found',
    message: '404 Not Found'
  })
})

// error handling middleware
app.use(function (err, req, res, next) {
  error(err)
  res.status(500).render('error', {
    title: '500 Server Error',
    message: err.message || err
  })
})

var tasks = [
  function (cb) {
    httpServer.listen(config.ports.http, config.host, cb)
  }
]

parallel(tasks, function (err) {
  if (err) throw err
  debug('listening on port %s', JSON.stringify(config.ports))
})

function error (err) {
  console.error(err.stack || err.message || err)
}
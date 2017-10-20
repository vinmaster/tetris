const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)
const path = require('path')
const Game = require(process.cwd() + '/src/server/Game')
const Socket = require(process.cwd() + '/src/server/Socket')
const Logger = require(process.cwd() + '/src/server/Logger')

app.get('/', (req, res, next) => {
  res.sendFile(process.cwd() + '/public/index.html')
})

if (app.get('env') === 'development') {
  const webpack = require('webpack')
  const webpackMiddleware = require('webpack-middleware')
  const webpackConfig = require(process.cwd() + '/webpack.config')
  const compiler = webpack(webpackConfig)

  app.use(webpackMiddleware(compiler, {
    publicPath: webpackConfig.output.publicPath,
    stats: { colors: true },
    contentBase: 'public'
  }))
}

// Set up public folder
app.use(express.static(path.join(__dirname, '../../public')))

// Start server
var port = process.env.PORT || 8000
server.listen(port, function() {
  var host = server.address().address
  if (app.get('env') === 'development') { host = 'localhost' }
  if (app.get('env') !== 'test') {
    Logger.log('App listening at http://' + host + ':' + server.address().port)
  }
})

// Access to server within app for testing
app.server = server

// Setup game
Game.setup()
Socket.setup(io)

module.exports = app

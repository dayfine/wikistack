const
  express = require('express'),
  app = express(),
  bodyParser = require('body-parser'),
  morgan = require('morgan'),
  nunjucks = require('nunjucks'),
  port = process.env.PORT || 3000

app.set('view engine', 'html')
app.engine('html', nunjucks.render)
nunjucks.configure('views', {noCache: true})

app.use(morgan('dev'))
app.use(require('method-override')('_method'))
app.use(express.static('public', {fallthrough: false}))
app.use(function (err, req, res, next) {
  res.status(err.status || 500)
  res.render(error, {error: err})
})

app.get('/', function (req, res) {
  // do something
})

app.get('/someOtherRoute', require('/toRouteFolder'))

app.listen(port, function () {
  console.log(`listening on port ${port}...`)
})

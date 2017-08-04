const
  express = require('express'),
  app = express(),
  models = require('./models'),
  morgan = require('morgan'),
  nunjucks = require('nunjucks'),
  port = process.env.PORT || 3000,
  Promise = require('bluebird')

Promise.config({ longStackTraces: true })

app.set('view engine', 'html')
app.engine('html', nunjucks.render)
nunjucks.configure('views', { noCache: true })

app.use(morgan('dev'))
app.use(require('body-parser').urlencoded({ extended: false }))
app.use(require('method-override')('_method'))
app.use(express.static('public'))


app.use('/', require('./routes'))
app.use(function (err, req, res, next) {
  res.status(err.status || 500)
  res.render('error', { error: err })
})

models.db.sync({ force: true })
  .then(() => app.listen(port, function () {
    console.log(`listening on port ${port}...`)
  }))
  .then(console.log(models.db.models))
  .then(() => models.User.create({
    name: 'Barto',
    email: 'barto@molina.com'
  }))
  .then(() => models.Page.create({
    title: 'page title',
    content: 'blablabla',
    authorId: 1
  }))
  .catch(console.error)


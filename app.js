const
  express = require('express'),
  app = express(),
  models = require('./models'),
  morgan = require('morgan'),
  nunjucks = require('nunjucks'),
  port = process.env.PORT || 3000,
  Promise = require('bluebird'),
  env = nunjucks.configure('views', { noCache: true }),
  AutoEscapeExtension = require('nunjucks-autoescape')(nunjucks)

Promise.config({ longStackTraces: true })
env.addExtension('AutoEscapeExtension', new AutoEscapeExtension(env))

app.set('view engine', 'html')
app.engine('html', nunjucks.render)

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
  .then(() => models.Page.bulkCreate([
    {title: 'page 1', content: '#blablabla', tags: ['one', 'two'], authorId: 1, status: 'open'},
    {title: 'page 2', content: '**blaba**', tags: ['three', 'two'], authorId: 1, status: 'open'},
    {title: 'page 3', content: 'bla [[page 2]]', tags: ['three'], authorId: 1, status: 'closed'}
  ], {validate: true, individualHooks: true}))
  .catch(console.error)

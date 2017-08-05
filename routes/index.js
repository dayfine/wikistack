const
  router = require('express').Router(),
  wikiRouter = require('./wiki'),
  userRouter = require('./user'),
  models = require('../models'),
  Page = models.Page

router
  .use('/wiki', wikiRouter)

  .use('/users', userRouter)

  .get('/', function (req, res, next) {
    Page.findAll()
    .then(pages => res.render('index', {pages}))
    .catch(next)
  })

module.exports = router

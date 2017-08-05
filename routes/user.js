const
  router = require('express').Router(),
  models = require('../models'),
  Page = models.Page,
  User = models.User

router
  .get('/', function (req, res, next) {
    User.findAll()
    .then(users => res.render('users', { users }))
  })

  .get('/:id', function (req, res, next) {
    Promise.all([
      User.findById(req.params.id),
      Page.findAll({ where: { authorId: req.params.id } })
    ])
    .then(results => res.render('user', { user: results[0], pages: results[1] }))
    .catch(next)
  })

  .post('/', function (req, res, next) {

  })

  .put('/:id', function (req, res, next) {

  })

  .delete('/:id', function (req, res, next) {

  })


module.exports = router

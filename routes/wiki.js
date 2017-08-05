const
  router = require('express').Router(),
  models = require('../models'),
  Page = models.Page,
  User = models.User

router
  .get('/', (req, res, next) => {
    res.redirect('/')
  })

  .post('/', function (req, res, next) {
    User.findOrCreate({
      where: { name: req.body.name, email: req.body.email }
    })
    .spread((user, metadata) => {
      return Page.create({
        title: req.body.title.trim(),
        content: req.body.content,
        tags: req.body.tags,
        status: req.body.status,
        authorId: user.id
      })
      .then(page => page.setAuthor(user))
    })
    .then(savedPage => res.redirect(savedPage.route))
    .catch(next)
  })

  .get('/add', function (req, res, next) {
    res.render('addpage')
  })

  .get('/search', function (req, res, next) {
    if (req.query.tag) {
      Page.findByTag(req.query.tag)
      .then(pages => res.render('search', { pages }))
      .catch(next)
    } else {
      res.render('search')
    }
  })

  .param('urlTitle', function (req, res, next, url) {
    req.resolveUrl = Page.findOne({
      where: { urlTitle: url },
      include: [{ model: User, as: 'author' }]
    })
    next()
  })

  .get('/:urlTitle', function (req, res, next) {
    req.resolveUrl
    .then(page => res.render('wikipage', { page }))
    .catch(next)
  })

  .put('/:urlTitle', function (req, res, next) {
    // needs more work to keep tags/status
    req.resolveUrl
    .then(page => res.render('addpage', {page}))
    .catch(next)
  })

  .delete('/:urlTitle', function (req, res, next) {
    req.resolveUrl
    .then(page => page.destroy())
    res.redirect('/')
  })

  .get('/:urlTitle/similar', function (req, res, next) {
    req.resolveUrl
    .then(page => page.findSimilar(page.tags, page.id))
    .then(pages => res.render('index', { pages }))
    .catch(next)
  })

module.exports = router

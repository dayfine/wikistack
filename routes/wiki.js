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
    Page.findOne({
      where: { urlTitle: url },
      include: [{ model: User, as: 'author' }]
    })
    .then(function (page) {
      if (!page) return res.render('error', {error: new Error('bad page')})

      req.page = page
      next()
    })
    .catch(next)
  })

  .get('/:urlTitle', function (req, res, next) {
    res.render('wikipage', { page: req.page })
  })

  .put('/:urlTitle', function (req, res, next) {
    req.page.update({
      title: req.body.title.trim(),
      content: req.body.content,
      tags: req.body.tags,
      status: req.body.status
    })
    .then(UpdatedPage => res.redirect(UpdatedPage.route))
    .catch(next)
  })

  .delete('/:urlTitle', function (req, res, next) {
    req.page.destroy()
    .then(() => res.redirect('/'))
    .catch(next)
  })

  .get('/:urlTitle/edit', function (req, res, next) {
    const edit = true
    res.render('addpage', {page: req.page, edit})
  })

  .get('/:urlTitle/similar', function (req, res, next) {
    req.page.findSimilar()
    .then(pages => res.render('index', { pages }))
    .catch(next)
  })

module.exports = router

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
    const tags = req.body.tags.split(/\s*,\s*/g)

    User.findOrCreate({ where: { name: req.body.name, email: req.body.email } })
    .then(results => {
      const
        user = results[0]
        page = Page.build({
          title: req.body.title,
          content: req.body.content,
          tags: tags,
          authorId: user.id
        })

      return page.save().then(page => {
        return page.setAuthor(user)
      })
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

  .get('/:urlTitle', function (req, res, next) {
    Page.findOne({
      where: { urlTitle: req.params.urlTitle },
      include: [{ model: User, as: 'author' }]
    })
    .then(page => res.render('wikipage', { page }))
    .catch(next)
  })

  .get('/:urlTitle/similar', function (req, res, next) {
    Page.findOne({
      where: { urlTitle: req.params.urlTitle },
      include: [{ model: User, as: 'author' }]
    })
    .then(page => page.findSimilar(page.tags, page.id))
    .then(pages => res.render('index',{pages}))
    .catch(next)
  })

module.exports = router

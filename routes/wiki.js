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
    //res.json(req.body)

    User.findOrCreate({
      where: {
        name: req.body.name,
        email: req.body.email
      }
    })
      .then(results => {
        const user = results[0]
        const page = Page.build({
          title: req.body.title,
          content: req.body.content,
          authorId: user.id
        })
        return page.save().then(page => {
          return page.setAuthor(user)
        })
      })
      .then(savedPage => res.redirect(savedPage.route))
      .catch(next);
  })

  .get('/add', function (req, res, next) {
    res.render('addpage')
  })

  .get('/:urlTitle', function (req, res, next) {
    Page.findOne({
      where: { urlTitle: req.params.urlTitle },
      include: [{ model: User, as: 'author' }]
    })
      .then(objPage => {
        res.render('wikipage', { page: objPage.dataValues })
      })
      .catch(next)
  })



module.exports = router

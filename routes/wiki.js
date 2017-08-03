const
  router = require('express').Router()
  models = require('../models'),
  Page = models.Page,
  User = models.User

router
  .post('/', function(req, res, next){
    //res.json(req.body)
    const page = Page.build({
      title: req.body.title,
      content: req.body.content
    })

    page.save()
    .then( savedPage=> res.redirect(savedPage.route))
    .catch(next);
  })

  .get('/add', function(req, res, next){
    res.render('addpage')
  })

  .get('/:urlTitle', function (req, res, next) {
    Page.findOne({
      where: {urlTitle: req.params.urlTitle}
    })
    .then(objPage => {
      res.render('wikipage',{page:objPage.dataValues})
    })
    .catch(next)
  })



module.exports = router

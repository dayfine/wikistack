const
  Sequelize = require('sequelize'),
  marked = require('marked'),
  db = new Sequelize('postgres://localhost:5432/wikistack', {
    logging: false
  })
  // db = new Sequelize(
  //   'wikistack', 'dayfine', null,
  //   {dialect: 'postgres', logging: false})

  /**
   * Note the implicit dependency of pg, and the fact that
   * here it is using v6.4, as v6.9 was giving sequelize errors
   */

db.authenticate()
  .then(() => console.log('connected'))
  .catch(console.error)

const Page = db.define('page', {
  title: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  urlTitle: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  content: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  status: {
    type: Sequelize.ENUM('open', 'closed')
  },
  tags: {
    type: Sequelize.ARRAY(Sequelize.STRING),
    set (values) {
      const arr = typeof values === 'string'
        ? values.split(/\s*,\s*/g)
        : values
      this.setDataValue('tags', arr)
    }
  },
  date: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW
  }
}, {
  getterMethods: {
    route () { return '/wiki/' + this.urlTitle },
    renderedContent () {
      const
          rendered = this.content.replace(/\[\[(.*?)\]\]/g, (match, p1) => {
            return '<a href="/wiki/' + urlize(p1) + '">' + p1 + '</a>'
          })
      return marked(rendered)
    }
  }
})

Page.beforeValidate((page, options) => {
  page.urlTitle = urlize(page.title)
})

Page.findByTag = tag => Page.findAll({ where: { tags: {$overlap: [tag]} } })

Page.prototype.findSimilar = function () {
  return Page.findAll({ where: { tags: {$overlap: this.tags}, id: {$ne: this.id}}})
}

function urlize (title) {
  return title
    ? title.replace(/\s+/g, '_').replace(/\W/g, '')
    : Math.random().toString(36).substring(2, 7)
}

const User = db.define('user', {
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: { isEmail: true },
    unique: true
  }
})

Page.belongsTo(User, { as: 'author' })

module.exports = { Page, User, db }

const
  Sequelize = require('sequelize'),
  marked = require('marked'),
// const db = new Sequelize('postgres://localhost:5432/wikistack', {
//   logging: false
// })
  db = new Sequelize(
    'wikistack','dayfine', null,
    {dialect:'postgres', logging: false})

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
    allowNull: false
  },
  content: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  status: {
    type: Sequelize.ENUM('open', 'closed')
  },
  tags: {
    type: Sequelize.ARRAY(Sequelize.STRING)
  },
  date: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW
  }
}, {
    getterMethods: {
      route(){return '/wiki/' + this.urlTitle} ,
      renderedContent(){
        const
          rendered = this.content.replace(/\[\[(.*?)\]\]/g, (match, p1) => {
            return '<a href="/wiki/' + urlize(p1) + '">' + p1 + '</a>'
          })
        return marked(rendered)
      }
    }
})

Page.findByTag = tag => Page.findAll({ where: { tags: {$overlap: [tag]} } })

Page.prototype.findSimilar = (tags, id) => {
  return Page.findAll({ where: { tags: {$overlap: tags} , id: {$ne: id}}})
}

Page.beforeValidate((page, options) => {
  page.urlTitle = urlize(page.title)
})

function urlize(title){
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

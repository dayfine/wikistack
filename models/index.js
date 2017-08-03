var Sequelize = require('sequelize')
var db = new Sequelize(
  'wikistack','dayfine', null,
  {dialect:'postgres', logging: false})

db.authenticate()
  .then(()=>console.log('connected'))
  .catch(console.error)

const Page = db.define('page', {
  title   : {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  urlTitle: {
    type: Sequelize.STRING,
    allowNull: false
  },
  content : {
    type: Sequelize.TEXT,
    allowNull: false
  },
  status  : {
    type: Sequelize.ENUM('open','closed')
  },
  date    : {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW
  }
}, {
    getterMethods: {
      route(){ return '/wiki/' + this.urlTitle }
    }
})

Page.beforeValidate((page, options)=>{
  page.urlTitle = page.title
                  ? page.title.replace(/\s+/g, '_').replace(/\W/g, '')
                  : Math.random().toString(36).substring(2, 7)
})

const User = db.define('user', {
  name  : {
    type: Sequelize.STRING,
    allowNull: false
  },
  email : {
    type: Sequelize.STRING,
    allowNull: false,
    validate: { isEmail: true },
    unique: true
  }
})

module.exports = { Page, User, db }

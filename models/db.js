const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const db = {};
let sequelize;

if (process.env.DATABASE_URL) {
  sequelize =  new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres', // hack: define dialect here to disable logging
    protocol: 'postgres',
    logging: false
  });
} else {
  const config = require(path.join(__dirname, './../config/config.json'))[env];
  sequelize = new Sequelize(config.database, config.username, config.password, {
    dialect: 'postgres', // hack: define dialect here to disable logging
    logging: false
  });
}

fs
  .readdirSync(__dirname)
  .filter(file => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js'))
  .forEach((file) => {
    const model = sequelize.import(path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.user = sequelize.import('Users.js');
db.presentations = sequelize.import('Presentations.js');
db.pdfs = sequelize.import('Pdfs.js');
db.audio = sequelize.import('Audio.js');
db.bookmarks = sequelize.import('Bookmarks.js');
db.downloads = sequelize.import('Downloads.js');
db.shares = sequelize.import('Shares.js');
db.views = sequelize.import('Views.js');

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;

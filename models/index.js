'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};
let sequelize;
if(env!='development'){
  sequelize = new Sequelize(
  "postgres://klxqqhbeqibwtn:63f6a95281fc935352e65258f4c53a0e7d1f87a3f3f2543c016fc282f2cc131f@ec2-99-81-238-134.eu-west-1.compute.amazonaws.com:5432/d45upfj0vuseo4");
  
}
else
{
   sequelize = new Sequelize(
    "postgres://postgres:94cfpmky@127.0.0.1:5432/cms_db");
    
}
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}
testConnection()

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;

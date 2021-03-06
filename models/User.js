'use strict';
module.exports = (sequelize, DataTypes) => {
  var User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      
      allowNull: false,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true
    },
   role: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    host: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    port: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    log: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    pswd: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    basedir:{
      type: DataTypes.STRING,
      allowNull: false,
  }
  }, {
    timestamps: false
  });
  return User;
}
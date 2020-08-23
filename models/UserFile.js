'use strict';
module.exports = (sequelize, DataTypes) => {
  var UserFile = sequelize.define('UserFile', {
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
    role: {
      type: DataTypes.STRING,
      allowNull: false
    },
   file: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  }, {
    timestamps: false
  });
  return UserFile;
}
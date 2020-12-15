'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      username: {
        allowNull: true,
        type: Sequelize.STRING
      },
      password: {
        allowNull: true,
        type: Sequelize.STRING
      },
      role: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      host: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      port: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      log: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      pswd: {
        type: Sequelize.STRING,
        allowNull: false,
      }
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Users');
  }
};
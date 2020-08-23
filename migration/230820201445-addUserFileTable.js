'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('UserFiles', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      username: {
        allowNull: false,
        type: Sequelize.STRING
      },
      role: {
        allowNull: false,
        type: Sequelize.STRING
      },
      file: {
        allowNull: false,
        type: Sequelize.STRING,
      }
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('UserFiles');
  }
};
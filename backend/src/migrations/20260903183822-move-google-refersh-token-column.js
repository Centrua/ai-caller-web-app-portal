'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'google_refresh_token');
    
    await queryInterface.addColumn('venues', 'google_refresh_token', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'google_refresh_token', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.removeColumn('venues', 'google_refresh_token');
  }
};
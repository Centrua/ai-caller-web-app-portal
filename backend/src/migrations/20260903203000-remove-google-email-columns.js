'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.removeColumn('venues', 'google_refresh_token');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('venues', 'google_refresh_token', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
};
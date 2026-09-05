'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add nylas_grant_id to venues if it doesn't already exist
    await queryInterface.addColumn('venues', 'nylas_grant_id', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('venues', 'nylas_grant_id');
  },
};

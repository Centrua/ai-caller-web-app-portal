'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('venues', 'phone');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('venues', 'phone', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  }
};

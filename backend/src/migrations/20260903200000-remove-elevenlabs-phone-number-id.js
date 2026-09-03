'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.removeColumn('venues', 'elevenlabs_phone_number_id');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('venues', 'elevenlabs_phone_number_id', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
};

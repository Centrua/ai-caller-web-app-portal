'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('venues', 'kb_document_id', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'ElevenLabs knowledge base document ID mapped 1:1 to the venue',
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('venues', 'kb_document_id');
  }
};
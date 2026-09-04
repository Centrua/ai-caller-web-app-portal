'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('venues', 'nylas_grant_id', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.renameColumn('email_conversation_routes', 'gmail_thread_id', 'email_thread_id');
    await queryInterface.renameColumn('email_conversation_routes', 'last_gmail_message_id', 'last_email_message_id');
    await queryInterface.addColumn('email_conversation_routes', 'reply_to_email', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('email_conversation_routes', 'subject', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('email_conversation_routes', 'subject');
    await queryInterface.removeColumn('email_conversation_routes', 'reply_to_email');
    await queryInterface.renameColumn('email_conversation_routes', 'last_email_message_id', 'last_gmail_message_id');
    await queryInterface.renameColumn('email_conversation_routes', 'email_thread_id', 'gmail_thread_id');
    await queryInterface.removeColumn('venues', 'nylas_grant_id');
  },
};
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('email_conversation_routes', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
      venue_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'venues', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      gmail_thread_id: { type: Sequelize.STRING, allowNull: false },
      elevenlabs_conversation_id: { type: Sequelize.STRING, allowNull: true },
      last_gmail_message_id: { type: Sequelize.STRING, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    })

    await queryInterface.addConstraint('email_conversation_routes', {
      fields: ['venue_id', 'gmail_thread_id'],
      type: 'unique',
      name: 'email_conversation_routes_venue_thread_unique',
    })
  },

  async down(queryInterface) {
    await queryInterface.dropTable('email_conversation_routes')
  },
}
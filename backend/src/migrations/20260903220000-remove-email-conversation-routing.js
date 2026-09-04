'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.dropTable('email_conversation_routes');
    await queryInterface.removeColumn('venues', 'nylas_grant_id');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('venues', 'nylas_grant_id', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.createTable('email_conversation_routes', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
      venue_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'venues', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      email_thread_id: { type: Sequelize.STRING, allowNull: false },
      elevenlabs_conversation_id: { type: Sequelize.STRING, allowNull: true },
      last_email_message_id: { type: Sequelize.STRING, allowNull: true },
      reply_to_email: { type: Sequelize.STRING, allowNull: true },
      subject: { type: Sequelize.STRING, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });

    await queryInterface.addConstraint('email_conversation_routes', {
      fields: ['venue_id', 'email_thread_id'],
      type: 'unique',
      name: 'email_conversation_routes_venue_thread_unique',
    });
  },
};

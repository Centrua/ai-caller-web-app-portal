/**
 * Create conversations and messages tables
 */
'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('conversations', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      thread_id: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      grant_id: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      subject: {
        type: Sequelize.STRING,
      },
      participants: {
        type: Sequelize.JSONB,
      },
      last_message_id: {
        type: Sequelize.STRING,
      },
      last_updated_at: {
        type: Sequelize.DATE,
      },
      unread_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    })

    await queryInterface.addIndex('conversations', ['thread_id', 'grant_id'], { unique: true, name: 'conversations_thread_grant_unique' })

    await queryInterface.createTable('messages', {
      id: {
        type: Sequelize.STRING,
        primaryKey: true,
      },
      thread_id: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      grant_id: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      subject: {
        type: Sequelize.STRING,
      },
      body: {
        type: Sequelize.TEXT,
      },
      snippet: {
        type: Sequelize.TEXT,
      },
      from: {
        type: Sequelize.JSONB,
      },
      to: {
        type: Sequelize.JSONB,
      },
      cc: {
        type: Sequelize.JSONB,
      },
      date: {
        type: Sequelize.DATE,
      },
      attachments: {
        type: Sequelize.JSONB,
      },
      unread: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      starred: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    })

    await queryInterface.addIndex('messages', ['thread_id', 'grant_id'], { name: 'messages_thread_grant_idx' })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('messages')
    await queryInterface.dropTable('conversations')
  },
}

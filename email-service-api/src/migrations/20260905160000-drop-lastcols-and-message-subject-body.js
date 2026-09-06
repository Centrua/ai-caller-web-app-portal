'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    // Drop conversation columns
    const convoDesc = await queryInterface.describeTable('conversations')
    if (convoDesc.last_message_id) {
      await queryInterface.removeColumn('conversations', 'last_message_id')
    }
    if (convoDesc.last_updated_at) {
      await queryInterface.removeColumn('conversations', 'last_updated_at')
    }

    // Drop message columns
    const msgDesc = await queryInterface.describeTable('messages')
    if (msgDesc.subject) {
      await queryInterface.removeColumn('messages', 'subject')
    }
    if (msgDesc.body) {
      await queryInterface.removeColumn('messages', 'body')
    }
  },

  async down(queryInterface, Sequelize) {
    // Add columns back on rollback
    await queryInterface.addColumn('conversations', 'last_message_id', { type: Sequelize.STRING })
    await queryInterface.addColumn('conversations', 'last_updated_at', { type: Sequelize.DATE })
    await queryInterface.addColumn('messages', 'subject', { type: Sequelize.STRING })
    await queryInterface.addColumn('messages', 'body', { type: Sequelize.TEXT })
  },
}

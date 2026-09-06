'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove participants and unread_count columns if present
    const table = 'conversations'
    const tableDesc = await queryInterface.describeTable(table)
    if (tableDesc.participants) {
      await queryInterface.removeColumn(table, 'participants')
    }
    if (tableDesc.unread_count) {
      await queryInterface.removeColumn(table, 'unread_count')
    }
  },

  async down(queryInterface, Sequelize) {
    // Re-create columns if rolling back
    await queryInterface.addColumn('conversations', 'participants', { type: Sequelize.JSONB })
    await queryInterface.addColumn('conversations', 'unread_count', { type: Sequelize.INTEGER, defaultValue: 0 })
  },
}

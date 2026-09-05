'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = 'messages'
    const tableDesc = await queryInterface.describeTable(table)
    if (tableDesc.cc) {
      await queryInterface.removeColumn(table, 'cc')
    }
    if (tableDesc.date) {
      await queryInterface.removeColumn(table, 'date')
    }
    if (tableDesc.attachments) {
      await queryInterface.removeColumn(table, 'attachments')
    }
    if (tableDesc.unread) {
      await queryInterface.removeColumn(table, 'unread')
    }
    if (tableDesc.starred) {
      await queryInterface.removeColumn(table, 'starred')
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('messages', 'cc', { type: Sequelize.JSONB })
    await queryInterface.addColumn('messages', 'date', { type: Sequelize.DATE })
    await queryInterface.addColumn('messages', 'attachments', { type: Sequelize.JSONB })
    await queryInterface.addColumn('messages', 'unread', { type: Sequelize.BOOLEAN, defaultValue: true })
    await queryInterface.addColumn('messages', 'starred', { type: Sequelize.BOOLEAN, defaultValue: false })
  },
}

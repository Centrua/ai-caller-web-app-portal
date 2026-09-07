'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add `body` column if it does not exist
    const desc = await queryInterface.describeTable('messages')
    if (!desc.body) {
      await queryInterface.addColumn('messages', 'body', { type: Sequelize.TEXT })
    }
  },

  async down(queryInterface, Sequelize) {
    const desc = await queryInterface.describeTable('messages')
    if (desc.body) {
      await queryInterface.removeColumn('messages', 'body')
    }
  },
}

'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove the legacy `snippet` column from `messages` table
    // Safe to run even if the column doesn't exist in some environments.
    const tableInfo = await queryInterface.describeTable('messages').catch(() => null)
    if (tableInfo && tableInfo.snippet) {
      await queryInterface.removeColumn('messages', 'snippet')
    }
  },

  async down(queryInterface, Sequelize) {
    // Re-add the `snippet` column in case of rollback
    await queryInterface.addColumn('messages', 'snippet', {
      type: Sequelize.TEXT,
      allowNull: true,
    })
  },
}

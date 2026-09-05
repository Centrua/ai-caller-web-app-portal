"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove columns that are no longer needed: auto_approve_drafts, require_approval
    const table = 'venue_settings'
    const col1 = 'auto_approve_drafts'
    const col2 = 'require_approval'
    const hasCol = async (col) => {
      const tableDesc = await queryInterface.describeTable(table)
      return Object.prototype.hasOwnProperty.call(tableDesc, col)
    }

    if (await hasCol(col1)) {
      await queryInterface.removeColumn(table, col1)
    }
    if (await hasCol(col2)) {
      await queryInterface.removeColumn(table, col2)
    }
  },

  async down(queryInterface, Sequelize) {
    // Add the columns back on rollback
    await queryInterface.addColumn('venue_settings', 'auto_approve_drafts', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    })
    await queryInterface.addColumn('venue_settings', 'require_approval', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    })
  }
}

/**
 * Replace partial unique index (status='draft') with full unique index
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remove existing index (if present) and add a unique index across all rows
    await queryInterface.removeIndex('outgoing_drafts', 'unique_draft_per_message_thread_grant')
    await queryInterface.addIndex('outgoing_drafts', ['original_message_id', 'thread_id', 'grant_id'], {
      name: 'unique_draft_per_message_thread_grant',
      unique: true,
    })
  },

  down: async (queryInterface, Sequelize) => {
    // Revert: remove the full unique index and recreate the partial index for drafts
    await queryInterface.removeIndex('outgoing_drafts', 'unique_draft_per_message_thread_grant')
    await queryInterface.addIndex('outgoing_drafts', ['original_message_id', 'thread_id', 'grant_id'], {
      name: 'unique_draft_per_message_thread_grant',
      unique: true,
      where: {
        status: 'draft',
      },
    })
  },
}

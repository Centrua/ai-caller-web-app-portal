/**
 * Add unique partial index to prevent duplicate draft creation
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Partial unique index only on rows with status = 'draft'
    await queryInterface.addIndex('outgoing_drafts', ['original_message_id', 'thread_id', 'grant_id'], {
      name: 'unique_draft_per_message_thread_grant',
      unique: true,
      where: {
        status: 'draft',
      },
    })
  },

  down: async (queryInterface) => {
    await queryInterface.removeIndex('outgoing_drafts', 'unique_draft_per_message_thread_grant')
  },
}

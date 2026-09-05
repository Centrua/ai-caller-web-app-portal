/**
 * Create outgoing_drafts table
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('outgoing_drafts', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      original_message_id: { type: Sequelize.STRING },
      thread_id: { type: Sequelize.STRING },
      grant_id: { type: Sequelize.STRING },
      subject: { type: Sequelize.STRING },
      body: { type: Sequelize.TEXT },
      status: { type: Sequelize.STRING },
      gemini_response: { type: Sequelize.JSONB },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    })
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('outgoing_drafts')
  }
}

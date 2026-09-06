/**
 * Add body_html column to outgoing_drafts
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('outgoing_drafts', 'body_html', { type: Sequelize.TEXT, allowNull: true })
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('outgoing_drafts', 'body_html')
  },
}

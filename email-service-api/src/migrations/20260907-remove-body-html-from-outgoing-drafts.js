/**
 * Remove body_html column from outgoing_drafts
 */
module.exports = {
  up: async (queryInterface) => {
    await queryInterface.removeColumn('outgoing_drafts', 'body_html')
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('outgoing_drafts', 'body_html', { type: Sequelize.TEXT, allowNull: true })
  },
}
